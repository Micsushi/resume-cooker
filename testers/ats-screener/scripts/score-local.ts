import fs from 'node:fs';
import { scoreResume } from '../src/lib/engine/scorer';

const [resumeTextPath, jobTextPath] = process.argv.slice(2);

if (!resumeTextPath) {
	console.error('Usage: tsx scripts/score-local.ts <resume-text.txt> [job-description.txt]');
	process.exit(1);
}

const resumeText = fs.readFileSync(resumeTextPath, 'utf8');
const jobDescription = jobTextPath ? fs.readFileSync(jobTextPath, 'utf8') : undefined;

const skills = [
	'Python',
	'C',
	'C++',
	'Java',
	'Kotlin',
	'R',
	'JavaScript',
	'TypeScript',
	'Bash',
	'Node.js',
	'REST API',
	'Express.js',
	'Flask',
	'FastAPI',
	'React',
	'Next.js',
	'Vue.js',
	'Tailwind',
	'Git',
	'Docker',
	'Kubernetes',
	'MongoDB',
	'Firebase',
	'PostgreSQL',
	'AWS',
	'Terraform',
	'Datadog',
	'Snyk',
	'CI/CD',
	'Agile',
	'Scrum',
	'DynamoDB',
	'Supabase',
	'Vercel'
].filter((skill) => resumeText.toLowerCase().includes(skill.toLowerCase()));

const sections = ['education', 'experience', 'projects', 'technical skills']
	.filter((section) => resumeText.toLowerCase().includes(section))
	.map((section) => (section === 'technical skills' ? 'skills' : section));

const bullets = resumeText
	.split(/(?:•|●| \u2022 | (?=[A-Z][a-z]+(?:ed|ted|ced|zed)\b))/)
	.map((part) => part.trim())
	.filter((part) => /\b(?:developed|established|accelerated|optimized|drove|minimized|slashed|boosted|improved|maintained|taught|mentored|reduced|secured|achieved|enhanced|integrated|built|led|engineered)\b/i.test(part));

const educationMatch = resumeText.match(/Education([\s\S]*?)Experience/i);
const educationText = educationMatch?.[1]?.trim() || '';

const wordCount = resumeText.split(/\s+/).filter(Boolean).length;

const results = scoreResume({
	resumeText,
	resumeSkills: skills,
	resumeSections: sections,
	experienceBullets: bullets,
	educationText,
	hasMultipleColumns: false,
	hasTables: false,
	hasImages: false,
	pageCount: 1,
	wordCount,
	jobDescription
});

console.log(
	JSON.stringify(
		results.map((result) => ({
			system: result.system,
			vendor: result.vendor,
			overallScore: result.overallScore,
			passesFilter: result.passesFilter,
			breakdown: result.breakdown,
			suggestions: result.suggestions
		})),
		null,
		2
	)
);
