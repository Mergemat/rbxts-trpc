export interface RuntimeTestResult {
    passed: boolean;
    checks: number;
}
export declare function runRuntimeTests(): Promise<RuntimeTestResult>;
