/**
 * Lightweight, zero-dependency Test Runner & Assertion Framework
 * Provides BDD describe/it blocks, rich assertions, structured reporting, and JSON exports.
 */

export interface TestResult {
  suiteName: string;
  testName: string;
  tier: string;
  passed: boolean;
  durationMs: number;
  error?: Error | string;
  stack?: string;
}

export interface SuiteResult {
  name: string;
  tier: string;
  passed: number;
  failed: number;
  total: number;
  durationMs: number;
  tests: TestResult[];
}

export interface RunSummary {
  timestamp: string;
  totalSuites: number;
  totalTests: number;
  passed: number;
  failed: number;
  durationMs: number;
  tiers: Record<string, { total: number; passed: number; failed: number }>;
  suites: SuiteResult[];
}

let currentSuite: string = 'Default Suite';
let currentTier: string = 'General';
const allResults: TestResult[] = [];
const suiteResults: Map<string, SuiteResult> = new Map();

export function setTier(tier: string): void {
  currentTier = tier;
}

export function describe(name: string, fn: () => void | Promise<void>): void {
  const previousSuite = currentSuite;
  currentSuite = name;

  if (!suiteResults.has(name)) {
    suiteResults.set(name, {
      name,
      tier: currentTier,
      passed: 0,
      failed: 0,
      total: 0,
      durationMs: 0,
      tests: [],
    });
  }

  try {
    const res = fn();
    if (res && typeof (res as any).then === 'function') {
      throw new Error(`Synchronous describe block expected in suite "${name}". Use async inside it().`);
    }
  } finally {
    currentSuite = previousSuite;
  }
}

export interface TestFn {
  (): void | Promise<void>;
}

export interface QueuedTest {
  suiteName: string;
  tier: string;
  testName: string;
  fn: TestFn;
}

const testQueue: QueuedTest[] = [];

export function it(name: string, fn: TestFn): void {
  testQueue.push({
    suiteName: currentSuite,
    tier: currentTier,
    testName: name,
    fn,
  });
}

// Expect assertion library
class Expectation<T = any> {
  private actual: T;
  private isNot: boolean;

  constructor(actual: T, isNot: boolean = false) {
    this.actual = actual;
    this.isNot = isNot;
  }

  get not(): Expectation<T> {
    return new Expectation(this.actual, !this.isNot);
  }

  toBe(expected: any): void {
    const match = Object.is(this.actual, expected);
    const pass = this.isNot ? !match : match;
    if (!pass) {
      throw new Error(
        `Expected ${JSON.stringify(this.actual)} ${this.isNot ? 'not to be' : 'to be'} ${JSON.stringify(expected)}`
      );
    }
  }

  toEqual(expected: any): void {
    const actualStr = JSON.stringify(this.actual);
    const expectedStr = JSON.stringify(expected);
    const match = actualStr === expectedStr;
    const pass = this.isNot ? !match : match;
    if (!pass) {
      throw new Error(
        `Expected ${actualStr} ${this.isNot ? 'not to deeply equal' : 'to deeply equal'} ${expectedStr}`
      );
    }
  }

  toBeTruthy(): void {
    const pass = this.isNot ? !this.actual : !!this.actual;
    if (!pass) {
      throw new Error(`Expected ${JSON.stringify(this.actual)} ${this.isNot ? 'to be falsy' : 'to be truthy'}`);
    }
  }

  toBeFalsy(): void {
    const pass = this.isNot ? !!this.actual : !this.actual;
    if (!pass) {
      throw new Error(`Expected ${JSON.stringify(this.actual)} ${this.isNot ? 'to be truthy' : 'to be falsy'}`);
    }
  }

  toBeDefined(): void {
    const match = this.actual !== undefined;
    const pass = this.isNot ? !match : match;
    if (!pass) {
      throw new Error(`Expected value ${this.isNot ? 'to be undefined' : 'to be defined'}`);
    }
  }

  toBeUndefined(): void {
    const match = this.actual === undefined;
    const pass = this.isNot ? !match : match;
    if (!pass) {
      throw new Error(`Expected ${JSON.stringify(this.actual)} ${this.isNot ? 'to be defined' : 'to be undefined'}`);
    }
  }

  toBeNull(): void {
    const match = this.actual === null;
    const pass = this.isNot ? !match : match;
    if (!pass) {
      throw new Error(`Expected ${JSON.stringify(this.actual)} ${this.isNot ? 'not to be null' : 'to be null'}`);
    }
  }

  toContain(expectedSubstringOrItem: any): void {
    let match = false;
    if (typeof this.actual === 'string') {
      match = this.actual.includes(String(expectedSubstringOrItem));
    } else if (Array.isArray(this.actual)) {
      match = this.actual.includes(expectedSubstringOrItem);
    } else if (this.actual && typeof this.actual === 'object') {
      match = expectedSubstringOrItem in this.actual;
    }
    const pass = this.isNot ? !match : match;
    if (!pass) {
      throw new Error(
        `Expected ${JSON.stringify(this.actual)} ${this.isNot ? 'not to contain' : 'to contain'} ${JSON.stringify(
          expectedSubstringOrItem
        )}`
      );
    }
  }

  toMatch(regex: RegExp): void {
    const match = typeof this.actual === 'string' && regex.test(this.actual);
    const pass = this.isNot ? !match : match;
    if (!pass) {
      throw new Error(`Expected "${this.actual}" ${this.isNot ? 'not to match' : 'to match'} ${regex}`);
    }
  }

  toBeGreaterThan(expected: number): void {
    const match = (this.actual as any) > expected;
    const pass = this.isNot ? !match : match;
    if (!pass) {
      throw new Error(`Expected ${this.actual} ${this.isNot ? 'not to be >' : 'to be >'} ${expected}`);
    }
  }

  toBeGreaterThanOrEqual(expected: number): void {
    const match = (this.actual as any) >= expected;
    const pass = this.isNot ? !match : match;
    if (!pass) {
      throw new Error(`Expected ${this.actual} ${this.isNot ? 'not to be >=' : 'to be >='} ${expected}`);
    }
  }

  toBeLessThan(expected: number): void {
    const match = (this.actual as any) < expected;
    const pass = this.isNot ? !match : match;
    if (!pass) {
      throw new Error(`Expected ${this.actual} ${this.isNot ? 'not to be <' : 'to be <'} ${expected}`);
    }
  }
}

export function expect<T = any>(actual: T): Expectation<T> {
  return new Expectation(actual);
}

// Runner Execution Engine
export async function runAllTests(options: { filterTier?: string; verbose?: boolean } = {}): Promise<RunSummary> {
  const startTime = Date.now();
  const filterTier = options.filterTier;

  const testsToRun = filterTier
    ? testQueue.filter((t) => t.tier.toLowerCase().includes(filterTier.toLowerCase()))
    : testQueue;

  console.log('\n=============================================================');
  console.log(`  TATTOO SHOP V2 - E2E TEST RUNNER`);
  console.log(`  Total tests scheduled: ${testsToRun.length}`);
  if (filterTier) console.log(`  Tier filter: ${filterTier}`);
  console.log('=============================================================\n');

  let currentSuitePrinted = '';

  for (const item of testsToRun) {
    if (item.suiteName !== currentSuitePrinted) {
      currentSuitePrinted = item.suiteName;
      console.log(`\n[\x1b[36m${item.tier}\x1b[0m] \x1b[1m${item.suiteName}\x1b[0m`);
    }

    const testStart = Date.now();
    let passed = false;
    let error: any = undefined;

    try {
      await item.fn();
      passed = true;
    } catch (err: any) {
      passed = false;
      error = err;
    }

    const durationMs = Date.now() - testStart;
    const result: TestResult = {
      suiteName: item.suiteName,
      testName: item.testName,
      tier: item.tier,
      passed,
      durationMs,
      error: error ? error.message || String(error) : undefined,
      stack: error ? error.stack : undefined,
    };

    allResults.push(result);

    const suite = suiteResults.get(item.suiteName) || {
      name: item.suiteName,
      tier: item.tier,
      passed: 0,
      failed: 0,
      total: 0,
      durationMs: 0,
      tests: [],
    };

    suite.total++;
    if (passed) {
      suite.passed++;
      console.log(`  \x1b[32m✓\x1b[0m ${item.testName} \x1b[90m(${durationMs}ms)\x1b[0m`);
    } else {
      suite.failed++;
      console.log(`  \x1b[31m✗\x1b[0m \x1b[31m${item.testName}\x1b[0m \x1b[90m(${durationMs}ms)\x1b[0m`);
      console.log(`    \x1b[31mError: ${error?.message || error}\x1b[0m`);
      if (options.verbose && error?.stack) {
        console.log(`    \x1b[90m${error.stack.split('\n').slice(1, 4).join('\n    ')}\x1b[0m`);
      }
    }
    suite.durationMs += durationMs;
    suite.tests.push(result);
    suiteResults.set(item.suiteName, suite);
  }

  const totalDurationMs = Date.now() - startTime;
  let totalPassed = 0;
  let totalFailed = 0;
  const tiers: Record<string, { total: number; passed: number; failed: number }> = {};

  for (const r of allResults) {
    if (!tiers[r.tier]) tiers[r.tier] = { total: 0, passed: 0, failed: 0 };
    tiers[r.tier].total++;
    if (r.passed) {
      totalPassed++;
      tiers[r.tier].passed++;
    } else {
      totalFailed++;
      tiers[r.tier].failed++;
    }
  }

  console.log('\n=============================================================');
  console.log(`  E2E TEST RUN SUMMARY`);
  console.log('=============================================================');
  console.log(`  Total Tests : ${allResults.length}`);
  console.log(`  Passed      : \x1b[32m${totalPassed}\x1b[0m`);
  console.log(`  Failed      : \x1b[${totalFailed > 0 ? '31' : '32'}m${totalFailed}\x1b[0m`);
  console.log(`  Duration    : ${(totalDurationMs / 1000).toFixed(2)}s`);
  console.log('-------------------------------------------------------------');
  console.log('  Tier Breakdown:');
  for (const [tier, stat] of Object.entries(tiers)) {
    const rate = stat.total > 0 ? ((stat.passed / stat.total) * 100).toFixed(1) : '0.0';
    console.log(`    ${tier.padEnd(28)} : ${stat.passed}/${stat.total} passed (${rate}%)`);
  }
  console.log('=============================================================\n');

  return {
    timestamp: new Date().toISOString(),
    totalSuites: suiteResults.size,
    totalTests: allResults.length,
    passed: totalPassed,
    failed: totalFailed,
    durationMs: totalDurationMs,
    tiers,
    suites: Array.from(suiteResults.values()),
  };
}

export function getTestQueue(): QueuedTest[] {
  return [...testQueue];
}

export function clearQueue(): void {
  testQueue.length = 0;
  allResults.length = 0;
  suiteResults.clear();
}
