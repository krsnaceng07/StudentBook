import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

// @ts-ignore
globalThis.WebSocket = ws;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase config environment variables missing from .env!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

async function seedDatabase() {
  try {
    console.log('🚀 Starting Supabase Database Seeding...');

    // 1. Create Mock Auth Users
    const mockUsers = [
      { email: 'krishna@gmail.com', password: 'Password123!', role: 'student', full_name: 'Krishna Sharma', initials: 'KS', university: 'Kathmandu University', bio: 'Full stack mobile engineer specializing in Flutter and React Native. Looking for ML partners!', skills: ['React Native', 'Flutter', 'Node.js', 'PostgreSQL'], interests: ['Mobile Development', 'Open Source', 'Hackathons'], goal: 'Kathmandu Tech Festival 2025' },
      { email: 'priya@gmail.com', password: 'Password123!', role: 'student', full_name: 'Priya Rana', initials: 'PR', university: 'Tribhuvan University', bio: 'UI/UX Designer who loves crafting premium visual styles and sleek mobile interface interactions.', skills: ['Figma', 'UI/UX', 'Product Design'], interests: ['Design Systems', 'Mobile Apps'], goal: 'Figma Prototyping Workshop' },
      { email: 'aakash@gmail.com', password: 'Password123!', role: 'student', full_name: 'Aakash KC', passwordConf: 'Password123!', role: 'student', full_name: 'Aakash KC', initials: 'AK', university: 'Kathmandu University', bio: 'Backend specialist focused on high performance microservices, Node.js, and secure cloud system logic.', skills: ['Node.js', 'Express', 'Redis', 'Docker'], interests: ['Backend Systems', 'Security'], goal: 'Kathmandu Tech Festival 2025' },
      { email: 'rohan@gmail.com', password: 'Password123!', role: 'student', full_name: 'Rohan Bhandari', initials: 'RB', university: 'Pokhara University', bio: 'AI researcher and data scientist building deep learning recommendation architectures.', skills: ['Python', 'PyTorch', 'FastAPI'], interests: ['Machine Learning', 'AI'], goal: 'Build ML Platform' },
      { email: 'college@gmail.com', password: 'Password123!', role: 'college', full_name: 'Kathmandu University', initials: 'KU', university: 'Kathmandu University Campus', bio: 'Official administration account managing elite technical festivals, engineering hackathons, and research projects.', skills: ['Event Planning', 'Academics'], interests: ['Education', 'Tech Innovation'], goal: 'Promote Student Innovation' }
    ];

    console.log('\n👤 Provisioning authentication profiles in auth.users...');
    const userIdsMap: Record<string, string> = {};

    for (const u of mockUsers) {
      // Check if user already exists
      const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw listError;

      let authUser = existingUsers.users.find(usr => usr.email === u.email);

      if (!authUser) {
        console.log(`Creating auth user: ${u.email}...`);
        const { data: newAuthUser, error: createError } = await supabase.auth.admin.createUser({
          email: u.email,
          password: u.password,
          email_confirm: true
        });

        if (createError) throw createError;
        authUser = newAuthUser.user;
      }

      const uid = authUser.id;
      userIdsMap[u.email] = uid;

      // Upsert into public.profiles
      console.log(`Upserting profile for: ${u.email} (ID: ${uid})...`);
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: uid, email: u.email, role: u.role });

      if (profileError) throw profileError;

      // Upsert into public.extended_profiles
      const { error: extProfileError } = await supabase
        .from('extended_profiles')
        .upsert({
          id: uid,
          initials: u.initials,
          full_name: u.full_name,
          role_title: u.role === 'student' ? 'Student & Innovator' : 'Educational institution',
          university: u.university,
          bio: u.bio,
          skills: u.skills,
          interests: u.interests,
          goal: u.goal
        });

      if (extProfileError) throw extProfileError;
    }

    // 2. Seed Events
    console.log('\n📅 Seeding events catalog...');
    const { data: seededEvents, error: eventsError } = await supabase
      .from('events')
      .upsert([
        {
          title: 'Nepal Tech Hackathon 2025',
          description: 'The premium engineering challenge for college minds. Solve real-world constraints in 48 hours!',
          event_type: 'Hackathon',
          organizer: 'Kathmandu University',
          event_date: '2025-09-15',
          location: 'KU Central Campus, Dhulikhel',
          banner_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d'
        },
        {
          title: 'Figma Prototyping Masterclass',
          description: 'Level up your prototyping, animation, and developer handoff workflows with design system experts.',
          event_type: 'Workshop',
          organizer: 'Tribhuvan University Campus',
          event_date: '2025-06-20',
          location: 'TU Central Hall, Kirtipur',
          banner_url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12'
        },
        {
          title: 'All Nepal AI Research Cup',
          description: 'Submit your deep learning solutions, NLP classifiers, and computer vision models for national prizes!',
          event_type: 'Competition',
          organizer: 'Lalitpur Engineering College',
          event_date: '2025-11-05',
          location: 'LEC Complex, Sanepa',
          banner_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4'
        }
      ])
      .select();

    if (eventsError) throw eventsError;

    // 3. Seed Connections & Collaboration Invites
    console.log('\n🔗 Seeding collaboration connection statuses...');
    const krishnaId = userIdsMap['krishna@gmail.com'];
    const priyaId = userIdsMap['priya@gmail.com'];
    const aakashId = userIdsMap['aakash@gmail.com'];
    const rohanId = userIdsMap['rohan@gmail.com'];

    // Krishna accepted Priya, pending invite from Rohan
    await supabase
      .from('connections')
      .upsert([
        { sender_id: krishnaId, receiver_id: priyaId, status: 'accepted' },
        { sender_id: krishnaId, receiver_id: aakashId, status: 'accepted' },
        { sender_id: rohanId, receiver_id: krishnaId, status: 'pending' }
      ]);

    // 4. Seed Messages & Live Conversations
    console.log('\n💬 Seeding private messaging logs...');
    // Create conversation between Krishna and Priya
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single();

    if (convError) throw convError;

    const conversationId = conv.id;

    // Add conversation participants
    await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: conversationId, user_id: krishnaId },
        { conversation_id: conversationId, user_id: priyaId }
      ]);

    // Add message bubbles
    await supabase
      .from('messages')
      .insert([
        { conversation_id: conversationId, sender_id: priyaId, content: "Hey Krishna! I saw your awesome profile on CollabSpace.\nAre you looking for teammates for the upcoming Nepal Tech Hackathon?" },
        { conversation_id: conversationId, sender_id: krishnaId, content: "Hey Priya! Yes, absolutely! I am planning to build a high-performance React Native app, but I need a solid UI/UX designer." },
        { conversation_id: conversationId, sender_id: priyaId, content: "Perfect! I have been crafting custom Figma mockups and typography guides specifically for technical mobile platforms. Let's form a team!" }
      ]);

    // 5. Seed Teams & Members
    console.log('\n🤝 Seeding collaboration team workspaces...');
    const { data: team, error: teamCreateError } = await supabase
      .from('teams')
      .insert({
        name: 'Team Innovators',
        event_name: 'Nepal Tech Hackathon 2025',
        created_by: krishnaId,
        max_members: 4
      })
      .select()
      .single();

    if (teamCreateError) throw teamCreateError;

    const teamId = team.id;

    // Add members to team
    await supabase
      .from('team_members')
      .insert([
        { team_id: teamId, user_id: krishnaId, role: 'Leader', skill_tag: 'React Native Dev' },
        { team_id: teamId, user_id: priyaId, role: 'Member', skill_tag: 'UI/UX Designer' },
        { team_id: teamId, user_id: aakashId, role: 'Member', skill_tag: 'Backend Architect' }
      ]);

    // 6. Seed Notifications
    console.log('\n🔔 Seeding notifications dashboard inbox...');
    await supabase
      .from('notifications')
      .insert([
        {
          user_id: krishnaId,
          actor_id: rohanId,
          type: 'connection_request',
          content: 'Rohan Bhandari sent you a collaboration request.',
          is_read: false
        },
        {
          user_id: krishnaId,
          actor_id: priyaId,
          type: 'connection_accepted',
          content: 'Priya Rana accepted your connection request.',
          is_read: true
        }
      ]);

    console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY! All credentials, profiles, connections, events, teams, and message streams are live!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ CRITICAL SCHEMA SEED FAILURE:', error.message);
    process.exit(1);
  }
}

seedDatabase();
