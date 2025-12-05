/**
 * GITEX Events Mock Data
 * Contains event data for World Entrepreneur Summit and ICEIRD Conference
 */

export const getGitexEvents = () => {
  return [
    {
      id: 'gitex-wes-2025',
      title: 'World Entrepreneur Summit',
      description:
        'The World Entrepreneur Summit (WES) Dubai 2025 is a two-day gathering that brings together entrepreneurs, investors, and industry leaders to explore emerging trends, showcase innovative ideas, and foster cross-border business collaboration. Through keynote speeches, panel discussions, networking sessions, and startup pitch opportunities, participants gain exposure to global best practices and regional growth pathways. The event is targeted at innovators across sectors such as AI, fintech, health, marketing, and more. This edition emphasizes building bridges between visionary founders and capital, while cultivating a supportive ecosystem of mentorship, partnerships, and dynamism.',
      content: `
        <div>
          <h2>Event Overview</h2>
          <p>The World Entrepreneur Summit (WES) Dubai 2025 is a two-day gathering that brings together entrepreneurs, investors, and industry leaders to explore emerging trends, showcase innovative ideas, and foster cross-border business collaboration.</p>

          <h3>Key Features</h3>
          <ul>
            <li>Keynote speeches from industry leaders</li>
            <li>Panel discussions on emerging trends</li>
            <li>Networking sessions with investors and entrepreneurs</li>
            <li>Startup pitch opportunities</li>
            <li>Exposure to global best practices</li>
            <li>Regional growth pathways exploration</li>
          </ul>

          <h3>Target Sectors</h3>
          <ul>
            <li>Artificial Intelligence (AI)</li>
            <li>Fintech</li>
            <li>Health & Healthcare</li>
            <li>Marketing & Digital Innovation</li>
            <li>And more emerging sectors</li>
          </ul>

          <h3>Event Highlights</h3>
          <p>This edition emphasizes building bridges between visionary founders and capital, while cultivating a supportive ecosystem of mentorship, partnerships, and dynamism.</p>
        </div>
      `,
      mediaType: 'Event',
      filterType: 'Events',
      businessStage: 'All Stages',
      domain: 'Strategy & Growth',
      format: 'Live Events',
      popularity: 'Latest',
      provider: {
        name: 'Golden Tree Events LLC',
        logoUrl: '/mzn_logo.png',
        description: 'Global event organizer specializing in entrepreneurship and innovation',
      },
      tags: ['Event', 'Entrepreneurship', 'Networking', 'Innovation', 'Investment', 'AI', 'Fintech'],
      imageUrl:
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
      date: '2025-11-01',
      eventDate: '2025-11-01',
      eventTime: '9:00 AM - 5:00 PM',
      eventLocation: 'Mövenpick Grand Al Bustan, Dubai, UAE',
      eventLocationDetails: 'Mövenpick Grand Al Bustan, Dubai, United Arab Emirates',
      eventRegistrationInfo: 'Paid entry - From AED 179 onward (depending on ticket tier). Register at nextevent.ai',
      eventAgenda: [
        {
          day: 'Day 1',
          date: 'November 1, 2025',
          sessions: [
            { time: '9:00 AM - 10:00 AM', title: 'Registration & Networking' },
            { time: '10:00 AM - 11:30 AM', title: 'Opening Keynote: Future of Entrepreneurship' },
            { time: '11:30 AM - 1:00 PM', title: 'Panel Discussion: AI & Innovation in Business' },
            { time: '1:00 PM - 2:00 PM', title: 'Lunch & Networking' },
            { time: '2:00 PM - 3:30 PM', title: 'Startup Pitch Sessions' },
            { time: '3:30 PM - 5:00 PM', title: 'Investor Meetups & Networking' },
          ],
        },
        {
          day: 'Day 2',
          date: 'November 2, 2025',
          sessions: [
            { time: '9:00 AM - 10:00 AM', title: 'Registration & Morning Coffee' },
            { time: '10:00 AM - 11:30 AM', title: 'Panel: Fintech & Financial Innovation' },
            { time: '11:30 AM - 1:00 PM', title: 'Workshops: Scaling Your Business' },
            { time: '1:00 PM - 2:00 PM', title: 'Lunch & Exhibition Tour' },
            { time: '2:00 PM - 4:00 PM', title: 'Mentorship Sessions & Networking' },
            { time: '4:00 PM - 5:00 PM', title: 'Closing Remarks & Awards' },
          ],
        },
      ],
    },
    {
      id: 'gitex-iceird-2025',
      title: 'International Conference on Entrepreneurship, Innovation and Regional Development (ICEIRD)',
      description:
        'The International Conference on Entrepreneurship, Innovation and Regional Development (ICEIRD) is a global forum that brings together researchers, academics, industry experts, and entrepreneurs to exchange insights on innovation and technology-driven growth. Held in Abu Dhabi, ICEIRD 2025 provides a platform for presenting cutting-edge research, sharing case studies, and exploring collaborative approaches to regional development through entrepreneurship and innovation.',
      content: `
        <div>
          <h2>About ICEIRD</h2>
          <p>The International Conference on Entrepreneurship, Innovation and Regional Development (ICEIRD) is a global forum that brings together researchers, academics, industry experts, and entrepreneurs to exchange insights on innovation and technology-driven growth.</p>

          <h3>Conference Objectives</h3>
          <ul>
            <li>Present cutting-edge research on entrepreneurship and innovation</li>
            <li>Share case studies and best practices</li>
            <li>Explore collaborative approaches to regional development</li>
            <li>Network with global researchers and practitioners</li>
            <li>Discuss technology-driven growth strategies</li>
          </ul>

          <h3>Who Should Attend</h3>
          <ul>
            <li>Researchers and Academics</li>
            <li>Industry Experts</li>
            <li>Entrepreneurs and Business Leaders</li>
            <li>Policy Makers</li>
            <li>Innovation Practitioners</li>
          </ul>

          <h3>Conference Highlights</h3>
          <p>ICEIRD 2025 provides a platform for presenting cutting-edge research, sharing case studies, and exploring collaborative approaches to regional development through entrepreneurship and innovation.</p>
        </div>
      `,
      mediaType: 'Event',
      filterType: 'Events',
      businessStage: 'All Stages',
      domain: 'Technology & Innovation',
      format: 'Live Events',
      popularity: 'Latest',
      provider: {
        name: 'Research Foundation (International Research Forum)',
        logoUrl: '/mzn_logo.png',
        description: 'International organization dedicated to advancing research in entrepreneurship and innovation',
      },
      tags: ['Event', 'Research', 'Innovation', 'Entrepreneurship', 'Regional Development', 'Conference'],
      imageUrl:
        'https://images.unsplash.com/photo-1591115765373-5207764f72e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
      date: '2025-10-30',
      eventDate: '2025-10-30',
      eventTime: '9:00 AM - 5:00 PM',
      eventLocation: 'Novotel Abu Dhabi Al Bustan',
      eventLocationDetails: 'Novotel Abu Dhabi Al Bustan, Shk. Rashid Bin Saeed St – Rabdan, Abu Dhabi, United Arab Emirates',
      eventRegistrationInfo: 'Paid entry - From AED 370 onward (depending on participant category). Includes conference materials, lunch, and participation certificate. Register at researchfoundation.org/iceird',
      eventAgenda: [
        {
          day: 'Day 1',
          date: 'Thursday, 30 October 2025',
          sessions: [
            { time: '9:00 AM - 9:30 AM', title: 'Registration' },
            { time: '9:30 AM - 10:00 AM', title: 'Introduction' },
            { time: '10:00 AM - 10:15 AM', title: 'Tea Break' },
            { time: '10:15 AM - 1:00 PM', title: 'Pre-Lunch Technical Session' },
            { time: '1:00 PM - 1:30 PM', title: 'Lunch' },
            { time: '1:30 PM - 5:00 PM', title: 'Post-Lunch Technical Session' },
          ],
        },
        {
          day: 'Day 2',
          date: 'Friday, 31 October 2025',
          sessions: [
            { time: '9:00 AM - 9:30 AM', title: 'Registration' },
            { time: '9:30 AM - 10:00 AM', title: 'Inaugural Session' },
            { time: '10:00 AM - 10:15 AM', title: 'Tea Break' },
            { time: '10:15 AM - 1:00 PM', title: 'Pre-Lunch Technical Session' },
            { time: '1:00 PM - 1:30 PM', title: 'Lunch' },
            { time: '1:30 PM - 4:00 PM', title: 'Post-Lunch Technical Session' },
            { time: '4:00 PM - 5:00 PM', title: 'Certificate Distribution' },
          ],
        },
      ],
    },
  ]
}
