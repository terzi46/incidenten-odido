# Push to Vercel via CLI

## Prerequisites

1. **Vercel CLI installed**: `npm install -g vercel`
2. **Logged in to Vercel**: `vercel login` (or check existing auth in `~/.local/share/com.vercel.cli/auth.json`)
3. **Git repository initialized**: Your project must be a Git repository

## Step-by-Step Process

### 1. Initialize Vercel Project
```bash
vercel
```

This will:
- Detect your project type (Next.js, React, etc.)
- Ask for project settings
- Create `vercel.json` configuration file

### 2. Configure Environment Variables
```bash
vercel env add <variable-name> <environment>
```

Environments: `production`, `preview`, `development`

### 3. Deploy to Preview
```bash
vercel --prod
```

Or for preview deployment:
```bash
vercel
```

### 4. Link Existing Project
If you have an existing Vercel project:
```bash
vercel link
```

### 5. Deploy with Specific Settings
```bash
vercel --prod --yes  # Skip prompts
```

## Common Commands

- `vercel whoami` - Check logged in user
- `vercel projects` - List your projects
- `vercel ls` - List deployments
- `vercel logs <url>` - View deployment logs
- `vercel rm <project-name>` - Remove project

## Configuration Files

### `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

### Environment Variables
Store in `.env.local` for development, use `vercel env` for production.

## Troubleshooting

1. **Authentication issues**: Delete `~/.local/share/com.vercel.cli` and run `vercel login`
2. **Build failures**: Check `vercel logs <url>`
3. **Missing files**: Ensure `outputDirectory` is correctly set

## Best Practices

1. Always test with preview deployment first
2. Use environment variables for secrets
3. Set up automatic deployments with Git integration
4. Configure custom domains if needed

## Next.js Specific Notes

- Vercel automatically detects Next.js projects
- App Router and Pages Router both supported
- Edge Functions and Serverless Functions work out of the box
- Image Optimization automatically configured