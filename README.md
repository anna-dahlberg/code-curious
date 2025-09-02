# Gamified Programming Tutorial Web App

This is a web application designed to introduce users to basic programming concepts through a gamified experience. Users interact with visual code blocks to influence a physics-based simulation, making programming concepts more accessible and fun!

## Features

- **Visual Code Blocks**: Users can drag and drop blocks to build simple code sequences.
- **Interactive Physics Simulations**: See immediate feedback as the code manipulates shapes and colors in a real-time physics environment.
- **Lessons**: Guided tutorials to introduce key programming concepts like variables, data types, and basic logic.
- **Responsive Design**: Optimized for desktop, with support for tablet and mobile views.

---

## Installation

Follow these steps to clone the repository and run the app locally:

### 1. Prerequisites

- **Node.js** (v16 or higher recommended)
- **npm** (or `pnpm`/`yarn`, if preferred)
- **Supabase account** (for backend database setup)

### 2. Clone the Repository

```bash
git clone https://github.com/yourusername/repo-name.git
cd repo-name
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Environment Variables

Create a `.env` file in the root of your project and provide your Supabase configuration. You’ll need:

- `VITE_SUPABASE_URL:` Your Supabase project URL.
- `VITE_SUPABASE_ANON_KEY:` Your Supabase anonymous public key.

Example `.env file:`

```bash
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Database Configuration

Use the following queries to set up and seed your tables in Supabase. You do this by going to the left hand side menu and choosing **SQL Editor** and inserting the following queries. 

##### Table creation

```bash
-- Create the lessons table (with title column needed by the app)
CREATE TABLE lessons (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    prev_lesson TEXT,
    next_lesson TEXT,
    snapshot JSONB,
    scene TEXT
);

-- Create the snapshots table (exact structure from instructions)
CREATE TABLE snapshots (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_slug TEXT NOT NULL,
    snapshot_data JSONB NOT NULL
);
```
#### Database security

```bash
-- Enable RLS on both tables
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;

-- Create policy for lessons - allow public read access
CREATE POLICY "Allow public read access to lessons" ON lessons
FOR SELECT USING (true);

-- Create policy for snapshots - users can only access their own snapshots
CREATE POLICY "Users can manage their own snapshots" ON snapshots
FOR ALL USING (auth.uid() = user_id);
```

#### Inser data from `DATABASE.md` 

```bash
-- Insert exact data from Database.md
INSERT INTO lessons (slug, title, content, prev_lesson, next_lesson, snapshot, scene) VALUES
(
    'welcome',
    'Welcome!',
    '["**Code Curious** is a fun and interactive way to learn the basics of programming—no coding experience needed.\n\nIn addition to the Lesson panel, where you''re reading this, your journey will unfold in the following three panels:\n\n#### The Editor\n\nThink of this as your code workshop. Here, you''ll assemble the step-by-step instructions that make up your code.\n\n#### The Console\n\nWhen you run your code, the Console is like your mission control, letting you keep an eye on what''s happening behind the scenes.\n\n#### The Playfield\n\nAt first glance, it may look like a black void, but this is actually a playground where your code comes alive with colors and shapes—and gravity.\n\nIf this feels a little mysterious or just plain bonkers, don''t worry! You''ll get the hang of each panel as your journey unfolds.\n\nReady to begin?"]'::jsonb,
    null,
    'lesson-1',
    null,
    null
), 
(
    'lesson-1',
    'Variables',
    '["Variables are one of the fundamental building blocks of coding. Think of a variable as a labeled box where we store information for safe keeping. By labeling the box, we can easily find and reuse the information whenever we need it.\n\n#### 1. Add a Variable\n\nIn the Editor, click the **Variable** button.","{{VariableButton","You''ll see a selection of data types, but for now, we''ll focus on just one. Choose **String**.\n\n#### 2. Strings Are Text\n\nWhen we want to store and work with simple text, we use a data type called a *string*. Why is it called a *string*? Imagine each letter and character strung together like pearls on a necklace—this is how text data is stored in programming!\n\n#### 3. Label Your Variable\n\nRemember, variables are like labeled boxes. Let''s label this one! Since this is your first variable, let''s go with something memorable, like `my first variable`?\n\n#### 4. Give Your Variable a Value\n\nWhat''s in the box? Right now, it''s empty, so let''s fill it with some data. How about your favorite color? When you have entered the name of a color in the **Value** input field, click **Save**. \n\n","{{VariableBlock|my first variable|yellow","#### 5. Congratulations!\n\nIf you now see a little block in the Editor showing your chosen label and your color, you''ve just created your first variable! Great job!\n\nGive yourself a pat on the back, and let''s move on to the next lesson."]'::jsonb,
    'welcome',
    'lesson-2',
    null,
    null
),
(
    'lesson-2',
    'Logging to the Console',
    '["#### 1. Meet the Console\n\nWhen you run your code, the Console acts like mission control, showing you everything happening behind the scenes. You''ll see messages from your own code here, as well as any messages from the system if something goes off track.\n\n#### 2. Your First Log\n\nClick the **Console Log** button to create your first log message!","{{LogButton","You can write anything you like, but let''s go with `Hello, Console!` for now. Enter your message and click **Save**. A new log block should now appear in the Editor with your message.","{{LogBlock|Hello, Console!","#### 3. Run Your Code\n\nReady? Make sure that the Console panel is expanded by clicking the **Console** tab. Then, click the **Run** button, and keep your eye on the Console. Spoiler alert: Your message should appear just like magic! Along with your message, you should also see two system messages, letting you know that your code has been run.","#### 4. Logging a Variable\n\nIn the last lesson, we created a variable with a label and a value. Now, let''s put a brand new variable to work by logging its value to the console. First, we''ll need to create a variable. Remember how? Click the **Variable** button, choose the data type **String**, enter a label and a string value. Since a label should be brief and descriptive, let''s improve on ''my first variable.'' How about labelling our new variable `color`? Need help choosing a color? Click the **Show color picker** checkbox, and try out different colors until you find one that suits you. Don''t forget to **Save**.\n\n#### 5. Your Second Log\n\nOnce again, click the **Console Log** button. Enter the message `My favorite color is`, and select your `color` variable in the **Variable** dropdown. Click **Save**. Can you guess what will happen when we run the code again?","{{VariableBlock|color|yellow","{{LogBlock|My favorite color is |color","#### 6. Run Your Code\n\nClick **Run** once more. Notice that the new message doesn''t just say, \"My favorite color is color\"? That''s because the Console reads the actual value stored in your variable, not just its label. So, if you edit your variable, the log message will update automatically the next time you run your code! Try it out if you''re curious. Click the variable block to edit it.\n\nWell done! That wraps up our Console shenanigans for now."]'::jsonb,
    'lesson-1',
    'lesson-3',
    null,
    null
),
(
    'lesson-3',
    'Actions and the Playfield',
    '["Underwhelmed? Don''t worry—we saved the best for last!\n\n#### 1. Actions\n\nSo far, you''ve stored, edited, and displayed data using the Editor and Console. But to interact with the Playfield, we need something called actions. Actions are what you use to make things happen in your code—beyond just Console messages. If variables are like boxes, then actions are what you **do** with the content of those boxes. You could shake it, toss it, stack it, pour it out on the floor. The content could even be used to inspire an interpretive dance number—the possibilities are endless!\n\n#### 2. Your First Action\n\nSee the catapult at the bottom of the Playfield? Wouldn''t it be great if we could drop something on it? Let''s dive in with a specific action called ''create circle.'' This action needs a bit of data to work, namely which color to use for our circle. And since we already stored a color variable, we''re all set to use it. Start by clicking the lightning bolt symbol next to your `color` variable in the Editor.","{{VariableBlock|color|yellow|action","#### 3. Select an Action\n\nIn the **Action** window, make sure your `color` variable is selected. From the list of **Actions** on the right, choose `create circle` and click **Save**. You''ve just told the Playfield, ''Hey, create a circle with my chosen color!''","{{ActionBlock|create circle|color","#### 4. Run Your Code\n\nBy now, you know the drill. To see your action take effect, click the **Run** button.\n\n#### 5. Celebrate!\n\nDid a circle in your color drop into the Playfield and onto the catapult? Well done!\n\nWhen you''re ready, catapult yourself to the next lesson."]'::jsonb,
    'lesson-2',
    'lesson-4',
    '[{"id":1730824855436,"name":"color","type":"string","value":"yellow","blockType":"variable"}]'::jsonb,
    'catapult'
),
(
    'lesson-4',
    'More Circles',
    '["With the tools you have now, you''re free to create as many circles in as many colors as you like. Experiment by replicating and running the code example below. See if you can topple that annoying stack of squares!","{{VariableBlock|color 1|turquoise|action","{{VariableBlock|color 2|pink|action","{{ActionBlock|create circle|color 1","{{ActionBlock|create circle|color 2","You have now reached the end of the last lesson currently available. Thanks for trying out **Code Curious**!"]'::jsonb,
    'lesson-3',
    null,
    null,
    'stack'
);
```
This is what the tables relations should look like:

##### `lessons` Table

| Column Name | Type  | Notes                                                 |
| ----------- | ----- | ----------------------------------------------------- |
| id          | int8  | Primary key, auto-incrementing                        |
| slug        | text  | Unique identifier for lessons                         |
| content     | jsonb | Lesson content in Markdown, as array of strings       |
| prev_lesson | text  | Used to display link                                  |
| next_lesson | text  | Used to display link                                  |
| snapshot    | jsonb | Holds any default code to be displayed in Editor      |
| scene       | text  | Holds any default bodies to be displayed in Playfield |

Please refer to `DATABASE.md` for more detailed `lessons` table example.

#### `snapshots` Table

| Column Name   | Type  | Notes                                    |
| ------------- | ----- | ---------------------------------------- |
| id            | int8  | Primary key, auto-incrementing           |
| user_id       | uuid  | User ID (foreign key to Auth -> User_id)                    |
| lesson_slug   | text  | Lesson slug (foreign key to Lesson -> Slug)                |
| snapshot_data | jsonb | Saved user-created code, lesson-specific |

### 6. Run the Development Server

Once your database is ready, start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser to use the app.

### 7. Contributing

We are not open to contributions for the time being.

### 8. License

MIT License
