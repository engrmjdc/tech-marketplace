insert into public.skills (name, category)
values
    ('Manual Testing', 'QA'),
    ('Test Automation', 'QA'),
    ('Playwright', 'QA'),
    ('Selenium', 'QA'),
    ('API Testing', 'QA'),
    ('Postman', 'QA'),
    ('Performance Testing', 'QA'),
    ('SQL', 'QA'),

    ('JavaScript', 'Development'),
    ('TypeScript', 'Development'),
    ('Python', 'Development'),
    ('Java', 'Development'),
    ('C#', 'Development'),
    ('PHP', 'Development'),
    ('React', 'Development'),
    ('Next.js', 'Development'),
    ('Node.js', 'Development'),

    ('Git', 'DevOps'),
    ('Docker', 'DevOps'),
    ('Kubernetes', 'DevOps'),
    ('CI/CD', 'DevOps'),
    ('AWS', 'Cloud'),
    ('Azure', 'Cloud'),
    ('Google Cloud', 'Cloud'),

    ('UI/UX Design', 'Design'),
    ('Figma', 'Design'),

    ('Machine Learning', 'AI & Data'),
    ('Generative AI', 'AI & Data'),
    ('Data Analysis', 'AI & Data')
on conflict (name) do nothing;