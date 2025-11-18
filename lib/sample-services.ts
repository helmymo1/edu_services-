// Example sample services used for local preview when the database is empty.
const sampleServices = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    title: 'Professional Essay Writing - Literature',
    description: 'A 1500-2000 word essay tailored to your prompt, with citations and proofreading included.',
    price: 75.0,
    delivery_days: 3,
    category: 'essay_writing',
    rating: 4.8,
    total_reviews: 58,
    image_url: '/examples/essay.jpg',
    is_active: true,
    tutor_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    profiles: { full_name: 'Dr. Emily Carter' }
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    title: 'Research Paper Assistance - Social Sciences',
    description: 'Guidance through the entire research paper process including lit review and formatting.',
    price: 150.0,
    delivery_days: 10,
    category: 'research_papers',
    rating: 4.6,
    total_reviews: 24,
    image_url: '/examples/research.jpg',
    is_active: true,
    tutor_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    profiles: { full_name: 'Prof. Mark Johnson' }
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    title: 'One-on-One Exam Prep (Calculus)',
    description: 'Personalized tutoring sessions focused on calculus concepts and past exam practice.',
    price: 40.0,
    delivery_days: 1,
    category: 'tutoring',
    rating: 4.9,
    total_reviews: 112,
    image_url: '/examples/tutoring.jpg',
    is_active: true,
    tutor_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    profiles: { full_name: 'Sophia Lee' }
  }
];

export default sampleServices;
