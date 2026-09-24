// Re-export from the shared module. The API server is the source of truth for
// scoring; the client copy exists only for tests and optimistic display.
export * from '@shared/scoring';
