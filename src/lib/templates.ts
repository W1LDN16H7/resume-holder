

export const defaultTemplates = [
  {
    name: "Professional",
    type: "professional" as const,
    createdAt: new Date(),
    content: `# [Your Name]
**Email:** your.email@example.com | **Phone:** (555) 123-4567 | **LinkedIn:** linkedin.com/in/yourname

## Professional Summary
Experienced professional with a proven track record of success in [your field]. Strong analytical and problem-solving skills with expertise in [key skills].

## Experience
### [Job Title] | [Company Name] | [Date Range]
- Achieved [specific accomplishment with metrics]
- Led [project/initiative] resulting in [outcome]
- Collaborated with [teams/departments] to [achieve goal]

### [Previous Job Title] | [Previous Company] | [Date Range]
- Managed [responsibility] leading to [result]
- Implemented [solution/process] improving [metric] by [percentage]

## Education
### [Degree] | [University Name] | [Graduation Year]
- Relevant coursework: [Course 1], [Course 2], [Course 3]
- GPA: [if 3.5 or higher]

## Skills
- **Technical:** [Skill 1], [Skill 2], [Skill 3]
- **Languages:** [Language 1], [Language 2]
- **Certifications:** [Certification 1], [Certification 2]`,
    isDefault: true,
  },
  {
    name: "Tech",
    type: "tech" as const,
    createdAt: new Date(),
    content: `# [Your Name] - Software Engineer
**Email:** your.email@example.com | **GitHub:** github.com/yourusername | **Portfolio:** yourportfolio.com

## Technical Skills
- **Languages:** JavaScript, TypeScript, Python, Java, C++
- **Frontend:** React, Vue.js, Angular, HTML5, CSS3, Tailwind CSS
- **Backend:** Node.js, Express, Django, Spring Boot
- **Databases:** PostgreSQL, MongoDB, Redis
- **Cloud:** AWS, Azure, Docker, Kubernetes
- **Tools:** Git, Jenkins, Jest, Webpack

## Experience
### Senior Software Engineer | [Company Name] | [Date Range]
- Architected and developed scalable web applications serving 100K+ users
- Optimized database queries reducing response time by 40%
- Mentored junior developers and conducted code reviews
- **Tech Stack:** React, Node.js, PostgreSQL, AWS

### Software Engineer | [Previous Company] | [Date Range]
- Built RESTful APIs handling 1M+ requests daily
- Implemented CI/CD pipelines reducing deployment time by 60%
- Collaborated in Agile environment with cross-functional teams
- **Tech Stack:** Vue.js, Python, Django, Docker

## Projects
### [Project Name] | [GitHub Link]
- Description of the project and its impact
- **Technologies:** React, TypeScript, Firebase

### [Another Project] | [GitHub Link]
- Description and key achievements
- **Technologies:** Python, FastAPI, PostgreSQL

## Education
### [Degree] in Computer Science | [University] | [Year]
- Relevant coursework: Data Structures, Algorithms, Software Engineering`,
    isDefault: true,
  },
  {
    name: "Creative",
    type: "creative" as const,
    createdAt: new Date(),
    content: `# [Your Name]
## Creative Professional

**Contact:** your.email@example.com | **Portfolio:** yourportfolio.com | **Instagram:** @yourusername

---

### About Me
Passionate creative professional with [X] years of experience in [your field]. I believe in the power of design to tell stories and create meaningful connections. My work spans across [areas of expertise], always with a focus on innovation and user experience.

### Experience

**[Job Title]** | *[Company Name]* | [Date Range]
→ Created compelling visual content for [target audience/purpose]
→ Collaborated with clients to bring their vision to life
→ Managed projects from concept to completion
→ Increased engagement by [percentage] through innovative design solutions

**[Previous Role]** | *[Previous Company]* | [Date Range]
→ Developed brand identity for [number] of clients
→ Led creative campaigns resulting in [specific outcome]
→ Mentored junior designers and interns

### Skills & Expertise
**Design Tools:** Adobe Creative Suite, Figma, Sketch, Canva
**Specialties:** Brand Identity, UI/UX Design, Print Design, Digital Marketing
**Software:** After Effects, Premiere Pro, Illustrator, Photoshop
**Other:** Project Management, Client Relations, Creative Direction

### Education
**[Degree]** in [Field] | *[University]* | [Year]
Relevant coursework: Visual Communication, Typography, Color Theory

### Notable Projects
• **[Project Name]** - [Brief description and impact]
• **[Project Name]** - [Brief description and impact]
• **[Project Name]** - [Brief description and impact]

---
*"Design is not just what it looks like and feels like. Design is how it works." - Steve Jobs*`,
    isDefault: true,
  },
]

export class TemplateService {
  private static STORAGE_KEY = "resume_wallet_templates"

  static async initializeTemplates(): Promise<void> {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) {
      await this.saveTemplates(defaultTemplates)
    }
  }

  static async getTemplates(): Promise<typeof defaultTemplates> {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        await this.saveTemplates(defaultTemplates)
        return defaultTemplates
      }
    }
    return defaultTemplates
  }

  static async saveTemplates(templates: typeof defaultTemplates): Promise<void> {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates))
  }

  static async addTemplate(template: Omit<(typeof defaultTemplates)[0], "isDefault">): Promise<void> {
    const templates = await this.getTemplates()
    const newTemplate = { ...template, isDefault: false }
    templates.push(newTemplate)
    await this.saveTemplates(templates)
  }

  static async updateTemplate(index: number, template: Partial<(typeof defaultTemplates)[0]>): Promise<void> {
    const templates = await this.getTemplates()
    if (templates[index]) {
      templates[index] = { ...templates[index], ...template }
      await this.saveTemplates(templates)
    }
  }

  static async deleteTemplate(index: number): Promise<void> {
    const templates = await this.getTemplates()
    if (templates[index] && !templates[index].isDefault) {
      templates.splice(index, 1)
      await this.saveTemplates(templates)
    }
  }
}
