# LiveAgent Knowledge Base Sync Prompt

Copy and paste this prompt to Claude Code when you want to sync the knowledge base with LiveAgent:

---

**Sync the knowledge base index.html with the current LiveAgent structure:**

1. Fetch the current structure from https://directhomeservice.ladesk.com/719488-Onboarding-for-Customer-Service-Agents- and extract all categories, sections, and their URLs

2. Update `/public/index.html` to include all available LiveAgent sections organized logically into categories

3. Maintain the current design and functionality:
   - Keep the Direct Home Service theme (navy blue #2E3192, Poppins font)
   - Preserve the search functionality with clear button
   - Keep the email support link (support@directhomeservice.com)
   - Remove icons from section headers
   - Ensure all LiveAgent links open in same window
   - Use only LiveAgent URLs, no local file links
   - Update copyright to show current year (for 2025 show just "2025", for future years show "2025-[current year]")

4. Organize sections logically (e.g., Core Operations, Customer Management, Reports, etc.)

5. Create a backup of the current index.html before making changes

---

This prompt will handle the sync process properly by fetching live data from LiveAgent and updating your knowledge base accordingly.