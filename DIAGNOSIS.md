# CI Pipeline Recovery Diagnosis

## 1. Type 1 — Assertion Failure
- **Step/Job Name**: `test` / Run tests
- **Exact Error Message**: 
  - `Expected: 100`, `Received: 90`
  - `Expected: {"amount": 10.01, "currency": "USD"}`, `Received: {"amount": 10.01, "currency": "USD"}` (with `toBe` vs `toEqual` error for strict equality)
- **File and Line Involved**: 
  - `src/payments/calculateDiscount.test.js` (line 8)
  - `src/utils/formatCurrency.test.js` (line 5)
- **Root Cause**: 
  - The `calculateDiscount` test incorrectly asserted that a 10% discount on 100 is 100, instead of 90. 
  - The `formatCurrency` test used `toBe` (strict identity check) instead of `toEqual` (value equality check) for comparing objects.
- **Why this is a problem**: It causes the test suite to fail even though the underlying business logic (`calculateDiscount.js` and `formatCurrency.js`) is actually correct. This prevents successful CI pipeline runs.
- **What the correct fix should be**: Update the assertions in the test files to expect the correct output and use the correct matcher. `toBe(100)` was changed to `toBe(90)`. `toBe({amount: 10.01, currency: 'USD'})` was changed to `toEqual({amount: 10.01, currency: 'USD'})`.

## 2. Type 2 — Dependency/Configuration Failure
- **Step/Job Name**: `install` / Install dependencies
- **Exact Error Message**: `npm error 'npm ci' can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with 'npm install' before continuing.` (Missing: lodash@4.18.1 from lock file)
- **File and Line Involved**: `package.json`, `package-lock.json`
- **Root Cause**: `package-lock.json` was out of sync with `package.json` (specifically the lodash dependency). Furthermore, the workflow originally used `npm install` which doesn't guarantee a reproducible build.
- **Why this is a problem**: A mismatched lockfile causes `npm ci` to fail, or if `npm install` is used, it can silently update the lockfile or install different dependency versions, leading to unreproducible builds across different CI runs.
- **What the correct fix should be**: Regenerate the `package-lock.json` locally using `npm install` to synchronize it with `package.json`, and update the GitHub Actions workflow to use `npm ci` for a clean, reproducible installation.

## 3. Type 3 — Workflow/Configuration Failure
- **Step/Job Name**: `test`
- **Exact Error Message**: `npm ERR! code ENOENT`, `npm ERR! syscall open`, `npm ERR! path /home/runner/work/ci-fix-drill/ci-fix-drill/package.json` or `sh: 1: jest: not found` (because node_modules is missing).
- **File and Line Involved**: `.github/workflows/ci.yml` (lines 20-27)
- **Root Cause**: The `test` job was completely separate from the `install` job. It lacked the `actions/checkout` step, meaning the repository wasn't even checked out on the runner for that job. It also lacked a dependency installation step and didn't declare `needs: install`.
- **Why this is a problem**: In GitHub Actions, each job runs on a fresh VM by default. Since the `test` job did not check out the code or install dependencies, there were no source files or `node_modules` to run the tests against, causing the job to fail immediately.
- **What the correct fix should be**: Consolidate the `install`, `lint`, and `test` steps into a single, sequential job (`build_and_test`). This ensures that the code is checked out once, dependencies are installed cleanly with `npm ci`, and then linting and testing run in the proper environment.
