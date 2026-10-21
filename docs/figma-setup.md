# Figma frontend workflow

## Design references

- [Restaurant ordering wireframes](https://www.figma.com/design/ll3N4XNRgLL9kwOti3ZEvw/ISDS-454---Restaurant-Ordering-UI-Wireframes?node-id=0-1)
- [Interactive wireframe prototype](https://www.figma.com/proto/ll3N4XNRgLL9kwOti3ZEvw/ISDS-454---Restaurant-Ordering-UI-Wireframes?node-id=68-2)
- [GitHub repository](https://github.com/JaimeG33/ISDS-FullStack-Restaurant-WebApp)

These are the supplied design references; the starter screen does not reproduce
their layouts. Attach the relevant frames to your Figma Make prompt.

## Connect the existing GitHub repository

1. Create a Figma Make file and look below the initial prompt for **Clone from GitHub**.
2. Use **Connect to GitHub** if prompted, sign in, and authorize the Figma GitHub app.
   Your Figma team/organization administrator may also need to connect the account
   and enable this repository for cloning.
3. Select `JaimeG33/ISDS-FullStack-Restaurant-WebApp`, choose `main`, and clone.
   A public repository can also be cloned by URL where that option is available.
4. If Figma asks for commands, use the settings below. Allow Figma to generate its
   environment-specific configuration files when prompted.
5. Create a branch such as `feature/figma-ui`, make changes, then push and open a
   pull request for review.

| Setting | Value |
| --- | --- |
| Working directory | Repository root |
| Install command | `npm ci` |
| Development command | `npm run dev` |
| Build command | `npm run build` |
| Default development port | `5173` (use the URL Vite prints) |
| Frontend source | `frontend/src/` |
| HTML entry | `frontend/index.html` |
| Build output | `frontend/dist/` |

For Figma Design code layers, use **Code → Clone repository** instead.
Feature availability depends on the Figma account and rollout. If only the older
**Create Repository** export appears, it creates a separate repository rather
than connecting this one. Download the generated source and integrate it into
`frontend/` if the clone workflow is unavailable.

## Local folder

The local checkout is:

```text
D:\ZeTechProjects\ISDS Capstone\ISDS-FullStack-Restaurant-WebApp
```

The separate **Make in your local codebase** beta currently documents a Mac-only
Figma Beta desktop requirement. Do not assume its **Open a folder** workflow is
available on Windows. Use GitHub cloning in the available cloud workflow instead.
No speculative `.figma/make` scripts are included; let the selected Figma workflow
create the configuration it needs.

## Suggested first prompt

> Use the attached ISDS restaurant ordering wireframes to build a responsive UI
> in the existing React + TypeScript + Vite app. Keep application code inside
> frontend/src and preserve the root npm workspace commands. Start with the menu
> screen, then add a cart and checkout prototype using synthetic data. Use reusable
> components and accessible controls. Keep database credentials out of the frontend.
> Clearly label simulated orders and payments. Do not build a live backend yet.

## Official references

- [Use Git with Figma Make and code layers](https://help.figma.com/hc/en-us/articles/44220165255063-Use-Git-with-Figma-Make-and-code-layers)
- [Manage the Figma GitHub app](https://help.figma.com/hc/en-us/articles/37516294384919-Manage-the-Figma-GitHub-app-for-a-team-or-organization)
- [Make in your local codebase](https://help.figma.com/hc/en-us/articles/40775535020695-Make-in-your-local-codebase)
