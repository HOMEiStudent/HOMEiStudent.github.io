# HOMEi Website Management Guide

This guide explains how to manage and update the HOMEi website content.

---

## Table of Contents

1. [File Structure Overview](#file-structure-overview)
2. [Uploading Images](#uploading-images)
3. [Uploading Videos](#uploading-videos)
4. [Editing Text Content](#editing-text-content)
5. [Managing the Quiz](#managing-the-quiz)
6. [Updating the FAQ](#updating-the-faq)
7. [Cache Busting](#cache-busting)
8. [Hidden Features](#hidden-features)
9. [Calculator Data Sources](#calculator-data-sources)

---

## File Structure Overview

```
new-design/
├── index.html          # Homepage
├── features.html       # Features page
├── how-it-works.html   # How it works + FAQ page
├── about.html          # About us page
├── contact.html        # Contact page
├── blog.html           # Blog page
├── privacy.html        # Privacy policy
├── terms.html          # Terms of service
├── 404.html            # Error page
│
├── styles/
│   └── main.css        # All CSS styles
│
├── scripts/
│   └── main.js         # All JavaScript functionality
│
├── data/
│   └── quiz-config.json  # Quiz questions and results (EDITABLE)
│
└── images/
    ├── logo/           # Logo files
    ├── icons/          # App store icons, QR code, etc.
    ├── screenshots/    # Phone screenshots for hero carousel
    ├── mascots/        # Mascot GIF animations
    ├── features/       # Feature-specific screenshots
    ├── about/          # Team photos and about page images
    └── social/         # Social media icons
```

---

## Uploading Images

### Hero Screenshots (Phone Carousel)
**Location:** `images/screenshots/`
**Files:**
- `screenshot-1.png` - First screenshot (shown by default)
- `screenshot-2.png` - Second screenshot
- `screenshot-3.png` - Third screenshot

**Recommended Size:** 280x560px (or similar phone aspect ratio)
**Format:** PNG with transparency or JPG

**To add more screenshots:**
1. Add new image files to `images/screenshots/`
2. Edit `index.html` and add new `<img>` tags in the `#phoneScreen` div
3. Add corresponding dots in `#screenshotDots`

### Feature Screenshots
**Location:** `images/features/`
**Files needed:**
- `calendar-screenshot.png`
- `bills-screenshot.png`
- `chores-screenshot.png`
- `shopping-screenshot.png`

**Note:** These appear as small preview thumbnails on the features page. If the file doesn't exist, the placeholder hides automatically.

### Mascot Images
**Location:** `images/mascots/`
**Files:**
- `mascot-calendar.gif`
- `mascot-bills.gif`
- `mascot-chores.gif`
- `mascot-lists.gif`
- `mascot-download.gif`
- `mascot-house.gif`
- `mascot-friends.gif`
- `mascot-happy.gif`

**Note:** If a mascot file is missing, an emoji fallback is shown automatically.

### About Page Team Photos
**Location:** `images/about/`
Add team member photos here. Update `about.html` to reference them.

### Logo
**Location:** `images/logo/homei-logo.png`
**Size:** 44x44px (or larger, will be scaled)

---

## Uploading Videos

### Demo Video (Day in the Life Section)
**Location:** `images/`
**Files needed:**
- `homei-demo.mp4` - Your demo video
- `video-poster.jpg` - Thumbnail shown before video plays

**Video Specifications:**
- **Format:** MP4 (H.264 codec for best compatibility)
- **Recommended resolution:** 1280x720 or 1920x1080
- **Aspect ratio:** 16:9
- **Max file size:** Keep under 10MB for fast loading

**To upload:**
1. Export your video as MP4
2. Name it `homei-demo.mp4`
3. Create a thumbnail image and name it `video-poster.jpg`
4. Upload both to the `images/` folder

---

## Editing Text Content

### Homepage Text
**File:** `index.html`

| Section | Line Numbers (approx) | What to Edit |
|---------|----------------------|--------------|
| Hero headline | ~122 | Main title "Student House Life, Simplified" |
| Hero subtitle | ~123 | Description text |
| Benefits | ~125-147 | Three benefit boxes |
| Feature cards | ~302-322 | Four feature descriptions |
| Testimonials | ~595-630 | Student quotes and names |
| CTA text | ~545-547 | Bottom call-to-action |

### Features Page
**File:** `features.html`
Each feature section contains:
- `<h2>` - Feature title
- `<p>` - Description paragraphs
- `<ul><li>` - Bullet point list

### How It Works Page
**File:** `how-it-works.html`
- Steps 1-4 are in separate `<section class="feature-detail">` blocks
- FAQ section uses accordion format (see [Updating the FAQ](#updating-the-faq))

---

## Managing the Quiz

### Quiz Configuration File
**File:** `data/quiz-config.json`

This JSON file controls all quiz questions and results. You can edit this file without touching any code.

### Structure:

```json
{
  "title": "What Type of Housemate Are You?",
  "questions": [
    {
      "id": 1,
      "question": "Your question text here?",
      "options": [
        {
          "text": "Answer option 1",
          "scores": { "organiser": 3, "peacekeeper": 1, "socialite": 0, "chilled": 0 }
        },
        {
          "text": "Answer option 2",
          "scores": { "organiser": 0, "peacekeeper": 3, "socialite": 1, "chilled": 1 }
        }
        // ... more options
      ]
    }
    // ... more questions
  ],
  "results": {
    "organiser": {
      "title": "The Organiser",
      "badge": "📋",
      "description": "Description of this personality type",
      "traits": ["Trait 1", "Trait 2", "Trait 3", "Trait 4"]
    }
    // ... other result types
  }
}
```

### How Scoring Works:
- Each answer option has scores for each personality type
- Scores are added up as the user answers
- The personality type with the highest total score is shown as the result

### To Add/Edit Questions:
1. Open `data/quiz-config.json`
2. Add new question objects to the `questions` array
3. Each question needs: `id`, `question` text, and `options` array
4. Each option needs: `text` and `scores` object
5. Save the file

### To Edit Results:
1. Modify the `results` object in `quiz-config.json`
2. Each result has: `title`, `badge` (emoji), `description`, `traits` array

---

## Updating the FAQ

### FAQ Location
**File:** `how-it-works.html`

The FAQ exists in TWO places in this file (both must be updated):

1. **JSON-LD Schema** (lines ~19-106) - For SEO/search engines
2. **Visible Accordion** (lines ~241-351) - What users see

### To Add a New FAQ:

**Step 1:** Add to JSON-LD schema (for SEO):
```html
{
    "@type": "Question",
    "name": "Your question here?",
    "acceptedAnswer": {
        "@type": "Answer",
        "text": "Your answer here."
    }
}
```

**Step 2:** Add to accordion (for users):
```html
<div class="faq-item">
    <button class="faq-question">
        <span class="faq-icon">❓</span>
        <span class="faq-question-text">Your question here?</span>
        <span class="faq-toggle">+</span>
    </button>
    <div class="faq-answer">
        <p class="faq-answer-content">Your answer here.</p>
    </div>
</div>
```

---

## Cache Busting

When you update CSS or JavaScript files, browsers may show old cached versions. To force browsers to load the new version:

1. Find all `?v=X.X` in HTML files
2. Increment the version number (e.g., `?v=2.6` → `?v=2.7`)

**Files that reference versioned assets:**
- All HTML files have: `main.css?v=X.X` and `main.js?v=X.X`

**Quick update command (in terminal):**
```bash
sed -i 's/v=2.6/v=2.7/g' *.html
```

---

## Hidden Features

### Gamification Section (Level Up Your House)
**Status:** Hidden but preserved for future use
**Location:** `index.html` line ~527

This section shows achievement badges and XP rewards. It's currently hidden with `style="display: none;"`.

**To enable it:**
1. Open `index.html`
2. Find `<section class="gamification-stats" style="display: none;">`
3. Remove `style="display: none;"` to show it

---

## Calculator Data Sources

The "How Much Time Could You Save?" calculator uses estimates based on the following research:

### Sources:

1. **SpareRoom Annual Flatmate Survey (2019-2023)**
   - URL: https://www.spareroom.co.uk/content/info-landlords/flatmate-survey
   - Finding: 67% of sharers spend 30+ minutes per month on bill admin
   - Finding: 40% argue about cleaning weekly

2. **UK Office for National Statistics - Time Use Survey (2020)**
   - URL: https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances
   - Finding: Household management takes 2-4 hours per week

3. **ARLA Propertymark Research**
   - Bills and chores are the top 2 causes of housemate disputes

### Calculation Formula:

```
Hours Saved = Bill Admin Time + Chore Coordination + Dispute Resolution

Where:
- Bill Admin = (bills per month × 15 mins) × 0.8 reduction
- Chore Coord = (housemates × 10 mins/week × 4 weeks) × 0.7 reduction
- Disputes = (frequency × 20 mins × housemates/3) × 0.6 reduction
```

### To Adjust Calculations:
Edit `scripts/main.js`, function `initTimeCalculator()` (around line 698)

---

## Quick Reference: File Locations

| What you want to change | File to edit |
|------------------------|--------------|
| Homepage content | `index.html` |
| Feature descriptions | `features.html` |
| FAQ questions/answers | `how-it-works.html` |
| Quiz questions | `data/quiz-config.json` |
| Styles/colors | `styles/main.css` |
| Interactive functionality | `scripts/main.js` |
| Hero screenshots | `images/screenshots/` |
| Demo video | `images/homei-demo.mp4` |
| Logo | `images/logo/homei-logo.png` |

---

## Need Help?

For code changes or complex updates, the main files are well-commented. Look for section headers like:

```css
/* ==========================================
   SECTION NAME
   ========================================== */
```

These help you navigate to specific areas quickly.

---

## References & Sources

### Calculator Data Sources

The time savings calculator uses estimates based on the following published research:

#### Primary Sources:

1. **SpareRoom (2019-2023). "Annual Flatmate Survey."**
   - Publisher: SpareRoom.co.uk
   - URL: https://www.spareroom.co.uk/content/info-landlords/flatmate-survey
   - Key findings used:
     - 67% of people sharing accommodation spend 30+ minutes per month on bill administration
     - 40% of flatmates report arguing about cleaning on a weekly basis
     - Bill payments and household cleanliness are the most common sources of conflict

2. **Office for National Statistics (2020). "Time Use Survey."**
   - Publisher: UK Government - ONS
   - URL: https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances
   - Key findings used:
     - Average UK adult spends 2-4 hours per week on household management tasks
     - Coordination activities increase with number of household members

3. **ARLA Propertymark (2022). "Private Rented Sector Report."**
   - Publisher: ARLA Propertymark (Association of Residential Letting Agents)
   - URL: https://www.arla.co.uk/research/
   - Key findings used:
     - Bills and chores consistently rank as top 2 causes of disputes in shared housing
     - Clear communication systems reduce tenant disputes by up to 50%

#### Supporting Research:

4. **NatWest Student Living Index (2023)**
   - Publisher: NatWest Bank
   - URL: https://www.natwest.com/life-moments/student-living-index.html
   - Context: Student household financial management patterns

5. **UCAS/Save the Student Survey (2023)**
   - Publisher: Save the Student
   - URL: https://www.savethestudent.org/money/student-money-survey.html
   - Context: Student time allocation and household responsibilities

### Calculation Assumptions

The calculator applies the following reduction factors based on app-assisted household management:

| Task | Manual Time | With App | Reduction |
|------|-------------|----------|-----------|
| Bill splitting | 15 mins/bill | 3 mins/bill | 80% |
| Chore coordination | 10 mins/person/week | 3 mins/person/week | 70% |
| Dispute resolution | 20 mins/dispute | 8 mins/dispute | 60% |

**Note:** These reduction factors are estimates based on typical productivity gains from task management software. Individual results may vary.

### Disclaimer

The calculator provides **estimates only** for illustrative purposes. Actual time savings will depend on:
- Individual household dynamics
- How consistently the app is used
- Number of active users in the household
- Complexity of bill-splitting arrangements

---

*Document last updated: February 2025*

