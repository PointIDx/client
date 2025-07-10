# Contributing to PointID

We welcome contributions to the PointID client application! By contributing, you help us improve and expand the platform for all users.

## How to Contribute

1.  **Fork the Repository:** Start by forking the `point_id_client` repository to your GitHub account.
2.  **Clone Your Fork:** Clone your forked repository to your local machine:
    ```bash
    git clone https://github.com/YOUR_USERNAME/point_id_client.git
    cd point_id_client
    ```
3.  **Create a New Branch:** Create a new branch for your feature or bug fix. Use a descriptive name (e.g., `feature/add-user-profile`, `bugfix/fix-login-issue`).
    ```bash
    git checkout -b your-branch-name
    ```
4.  **Set Up Development Environment:**
    *   Install dependencies:
        ```bash
        npm install
        ```
    *   Run the development server:
        ```bash
        npm run dev
        ```
        This will start the application, usually accessible at `http://localhost:5173/`.

5.  **Make Your Changes:** Implement your feature or fix the bug. Ensure your code adheres to the existing coding style and conventions.

6.  **Test Your Changes:**
    *   **Unit Tests:** Run unit tests to ensure your changes haven't introduced regressions and new features are covered.
        ```bash
        npm run test:unit
        ```
    *   **End-to-End Tests:** If your changes affect user flows, consider running or adding E2E tests.
        ```bash
        # Install browsers for the first run
        npx playwright install
        # Build the project first
        npm run build
        # Run E2E tests
        npm run test:e2e
        ```

7.  **Commit Your Changes:** Write clear and concise commit messages. Follow the conventional commits specification if possible (e.g., `feat: add new user dashboard`, `fix: correct typo in README`).
    ```bash
    git add .
    git commit -m "feat: your commit message"
    ```

8.  **Push to Your Fork:**
    ```bash
    git push origin your-branch-name
    ```

9.  **Create a Pull Request:** Go to your forked repository on GitHub and create a new pull request to the `main` branch of the original `point_id_client` repository. Provide a detailed description of your changes.

## Code Style and Quality

*   **Follow Existing Conventions:** Please adhere to the existing code style, formatting, and architectural patterns found in the codebase.
*   **TypeScript:** All new code should be written in TypeScript.
*   **Linting:** Ensure your code passes linting checks. Your IDE with Volar should help, but you can also run linting manually if configured in `package.json`.

## Reporting Bugs

If you find a bug, please open an issue on the GitHub repository. Provide as much detail as possible, including steps to reproduce, expected behavior, and actual behavior.

## Suggesting Enhancements

For new features or enhancements, please open an issue first to discuss your ideas with the maintainers before starting work on a pull request.
