# RENFAYE LASHES - Premium Eyelash Extensions

A modern, responsive e-commerce website for RENFAYE LASHES, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Modern & Responsive Design**: Looks great on all devices
- **Performance Optimized**: Fast loading times with Next.js
- **E-commerce Ready**: Built with product listings and shopping cart functionality in mind
- **SEO Friendly**: Optimized for search engines with Next.js SEO features
- **Beautiful Animations**: Smooth transitions and interactions

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript
- **Icons**: React Icons
- **Animation**: Framer Motion
- **Form Handling**: React Hook Form
- **State Management**: React Context API

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/renfaye-lashes.git
   cd renfaye-lashes
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

```
src/
├── app/                    # App router
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # Reusable components
│   ├── layout/             # Layout components
│   └── home/               # Home page components
├── public/                 # Static files
│   └── images/             # Image assets
└── styles/                 # Global styles
```

## Environment Variables

Create a `.env.local` file in the root of your project and add the following environment variables:

```
NEXT_PUBLIC_API_URL=your_api_url_here
# Add other environment variables as needed
```

## Deployment

### Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Other Platforms

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details on deploying to other platforms.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
