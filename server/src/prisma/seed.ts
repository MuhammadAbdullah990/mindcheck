import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { ASSESSMENTS } from '@shared/questionnaires';

const prisma = new PrismaClient();

/**
 * Idempotent seed: safe to re-run. Assessments are upserted by slug, and
 * resources are cleared and re-inserted so edits here don't accumulate
 * duplicates.
 */
async function main() {
  console.log('Seeding assessments…');

  for (const a of ASSESSMENTS) {
    const data = {
      name: a.name,
      fullName: a.fullName,
      description: a.description,
      instructions: a.instructions,
      timeframe: a.timeframe,
      estimatedTime: a.estimatedTime,
      totalItems: a.totalItems,
      maxScore: a.maxScore,
      subscales: a.subscales,
    };
    await prisma.assessment.upsert({
      where: { slug: a.slug },
      create: { slug: a.slug, ...data },
      update: data,
    });
    console.log(`  ✓ ${a.name} (${a.slug})`);
  }

  console.log('Seeding resources…');

  // Crisis lines are hard-coded in resource.service.ts so they are always
  // available. These are the non-crisis resources shown on results pages.
  const resources = [
    {
      title: 'MoodGYM',
      description: 'Free online CBT program for depression and anxiety, based on Australian research. Takes about 20 minutes per module.',
      url: 'https://moodgym.com.au',
      type: 'WEBSITE' as const,
      category: 'depression',
      severityMin: 'mild',
      country: 'global',
      sortOrder: 10,
    },
    {
      title: 'This Way Up — Stress Management Course',
      description: 'Free online courses and workbooks for anxiety, depression and stress, developed by UNSW Sydney.',
      url: 'https://www.thiswayup.org.au',
      type: 'WEBSITE' as const,
      category: 'general',
      severityMin: 'mild',
      country: 'global',
      sortOrder: 11,
    },
    {
      title: 'NIMHANS Helpline (India)',
      description: 'Free national mental health helpline offering tele-counselling in 20 languages.',
      url: null,
      phone: '14416',
      type: 'HOTLINE' as const,
      category: 'general',
      severityMin: 'mild',
      country: 'IN',
      sortOrder: 12,
    },
    {
      title: 'NHS Every Mind Matters',
      description: 'Free practical guides and videos from the UK NHS for managing stress, anxiety and low mood.',
      url: 'https://www.nhs.uk/mental-health/every-mind-matters/',
      type: 'WEBSITE' as const,
      category: 'anxiety',
      severityMin: 'mild',
      country: 'UK',
      sortOrder: 13,
    },
    {
      title: 'Mindfulness-Based Stress Reduction (MBSR)',
      description: 'An 8-week structured course teaching mindfulness to reduce stress. Widely available online and in person.',
      url: 'https://www.who.int/teams/mental-health-and-substance-use/promotion-prevention/mental-health-in-workplaces',
      type: 'ARTICLE' as const,
      category: 'stress',
      severityMin: 'mild',
      country: 'global',
      sortOrder: 14,
    },
    {
      title: 'Mental Health America',
      description: 'US-based nonprofit offering screening tools, support groups and referrals to local services.',
      url: 'https://www.nhanxiety.org',
      type: 'ORGANIZATION' as const,
      category: 'general',
      severityMin: 'moderate',
      country: 'US',
      sortOrder: 20,
    },
    {
      title: 'Psychology Today — Find a Therapist',
      description: 'Searchable directory of licensed therapists by location, speciality and insurance.',
      url: 'https://www.psychologytoday.com/us/therapists',
      type: 'WEBSITE' as const,
      category: 'general',
      severityMin: 'moderate',
      country: 'global',
      sortOrder: 21,
    },
    {
      title: 'BetterHelp',
      description: 'Online counselling and therapy with licensed professionals, available by text, phone and video.',
      url: 'https://www.betterhelp.com',
      type: 'APP' as const,
      category: 'general',
      severityMin: 'moderate',
      country: 'US',
      sortOrder: 22,
    },
    {
      title: 'Pakistan Association for Mental Health',
      description: 'Information, awareness and referral support for mental health in Pakistan.',
      url: null,
      phone: null,
      type: 'ORGANIZATION' as const,
      category: 'general',
      severityMin: 'moderate',
      country: 'PK',
      sortOrder: 23,
    },
    {
      title: 'Talking to a Professional',
      description: 'If your symptoms are moderate to severe, a doctor or therapist can help you understand what is happening and what support is available.',
      url: null,
      phone: null,
      type: 'SELF_HELP' as const,
      category: 'general',
      severityMin: 'severe',
      country: 'global',
      sortOrder: 30,
    },
  ];

  // Replace rather than upsert — resources are read-only reference data, and
  // a full replace keeps removed entries from lingering.
  await prisma.resource.deleteMany();
  for (const r of resources) {
    await prisma.resource.create({ data: r });
  }
  console.log(`  ✓ ${resources.length} resources`);

  console.log('\nSeed complete.\n');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
