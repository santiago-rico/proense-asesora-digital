# ProEnse Asesora Digital

This is the official website for ProEnse Asesora Digital, an insurance advisory firm. The platform is designed to inform users about various insurance products and generate leads through a comprehensive, multi-step quotation form.

## Tech Stack

This project is built with a modern, type-safe, and efficient stack:

- **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) for component architecture.
- **Form Management**: [React Hook Form](https://react-hook-form.com/) for performance and validation.
- **Schema Validation**: [Zod](https://zod.dev/) for type-safe schema declaration and validation.
- **Routing**: [React Router](https://reactrouter.com/)
- **Content Management**: [Sanity.io](https://www.sanity.io/) for the blog and dynamic page content.
- **API/Backend**: Serverless functions deployed on [Vercel](https://vercel.com/).

## Key Features

- **Dynamic Insurance Product Pages**: Pages for each type of insurance are generated dynamically.
- **Multi-Step Quotation Form**: A detailed 5-step form to capture client information for insurance quotes. It features:
  - Conditional logic to show fields based on the selected insurance type.
  - Real-time validation with clear error messages.
  - File uploads for required documents.
  - A final summary step for user review.
- **Lead Generation**: Integrated lead capture forms and modals that send data to a CRM via API (Brevo).
- **Blog**: A fully-featured blog powered by the Sanity CMS.
- **Static & Informational Pages**: About Us, Client Service, Payments, and Contact pages.

## Getting Started

To run this project locally, follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/en) (LTS version recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone <YOUR_GIT_URL>
    cd proense-asesora-digital
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the example file:
    ```sh
    cp .env.example .env
    ```
    Then, fill in the required values in the new `.env` file. You will need credentials for:
    - **Sanity**: Project ID, Dataset, and API Token.
    - **Brevo (or other email API)**: API Key.

4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or another port if 5173 is busy).

## Available Scripts

- `npm run dev`: Starts the development server with Hot Module Replacement (HMR).
- `npm run build`: Bundles the application for production.
- `npm run lint`: Lints the codebase using ESLint.
- `npm run preview`: Serves the production build locally for previewing.
- `npm test`: Runs unit and integration tests with Vitest.
- `npm run db:seed`: Seeds the Sanity database with initial data.
- `npm run db:clear`: Clears the Sanity database.

## Sanity CMS

The blog content is managed through Sanity. The schema definitions are located in the `proense-asesora-digital/schemaTypes` directory. To manage content, visit the [Sanity Studio](https://www.sanity.io/manage) for this project.

## Deployment

The project is configured for seamless deployment to [Vercel](https://vercel.com/). Any server-side logic is placed in the `api/` directory, which Vercel automatically deploys as Serverless Functions.
