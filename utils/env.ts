import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  baseUrl: required('BASE_URL', 'https://www.saucedemo.com'),
  users: {
    standard: {
      username: required('STANDARD_USER', 'standard_user'),
      password: required('STANDARD_PASSWORD', 'secret_sauce'),
    },
    lockedOut: {
      username: required('LOCKED_OUT_USER', 'locked_out_user'),
      password: required('STANDARD_PASSWORD', 'secret_sauce'),
    },
    problem: {
      username: required('PROBLEM_USER', 'problem_user'),
      password: required('STANDARD_PASSWORD', 'secret_sauce'),
    },
    error: {
      username: required('ERROR_USER', 'error_user'),
      password: required('STANDARD_PASSWORD', 'secret_sauce'),
    },
    visual: {
      username: required('VISUAL_USER', 'visual_user'),
      password: required('STANDARD_PASSWORD', 'secret_sauce'),
    },
    performanceGlitch: {
      username: required('PERFORMANCE_GLITCH_USER', 'performance_glitch_user'),
      password: required('STANDARD_PASSWORD', 'secret_sauce'),
    },
  },
  isCI: !!process.env.CI,
};
