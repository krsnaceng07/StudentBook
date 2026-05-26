import { Request, Response } from 'express';
import { supabaseAdmin as supabase } from '../../config/supabase.js';

/**
 * 1. Send connection request
 * Route: POST /api/v1/connections/request
 */
export const sendConnectionRequest = async (req: Request, res: Response) => {
  try {
    const senderId = (req as any).user?.id;
    const { receiverId } = req.body;

    if (!senderId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!receiverId) {
      return res.status(400).json({ success: false, error: 'Receiver ID is required' });
    }

    // Security Check: A user cannot send a connection request to themselves
    if (senderId === receiverId) {
      return res.status(400).json({ 
        success: false, 
        error: 'You cannot send a collaboration request to yourself' 
      });
    }

    // Check if the receiver exists in extended_profiles
    const { data: receiverProfile, error: profileErr } = await supabase
      .from('extended_profiles')
      .select('full_name')
      .eq('id', receiverId)
      .single();

    if (profileErr || !receiverProfile) {
      return res.status(404).json({ success: false, error: 'Target student profile not found' });
    }

    // Check if any connection request already exists (either sender -> receiver or receiver -> sender)
    const { data: existingConnection, error: connCheckErr } = await supabase
      .from('connections')
      .select('*')
      .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`);

    if (existingConnection && existingConnection.length > 0) {
      const conn = existingConnection[0];
      if (conn.status === 'accepted') {
        return res.status(400).json({ success: false, error: 'You are already connected with this student' });
      }
      if (conn.status === 'pending') {
        return res.status(400).json({ success: false, error: 'A pending connection request already exists between you' });
      }
    }

    // Insert new connection request
    const { data: newConn, error: insertErr } = await supabase
      .from('connections')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        status: 'pending'
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    // Fetch sender's name for notification content
    const { data: senderProfile } = await supabase
      .from('extended_profiles')
      .select('full_name')
      .eq('id', senderId)
      .single();

    const senderName = senderProfile?.full_name || 'A classmate';

    // Create Notification for the receiver
    await supabase.from('notifications').insert({
      user_id: receiverId,
      actor_id: senderId,
      type: 'connection_request',
      content: `${senderName} sent you a collaboration request!`
    });

    // Create Activity for the sender
    await supabase.from('activities').insert({
      user_id: senderId,
      action_type: 'connection_request',
      description: `Sent a collaboration request to ${receiverProfile.full_name}`
    });

    res.status(201).json({
      success: true,
      message: 'Collaboration request sent successfully',
      data: newConn
    });
  } catch (error: any) {
    console.error('Error sending connection request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 2. Get incoming pending connection requests
 * Route: GET /api/v1/connections/incoming
 */
export const getIncomingRequests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Query pending connection requests where current user is receiver
    const { data: connections, error } = await supabase
      .from('connections')
      .select('*')
      .eq('receiver_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch profile details for each sender
    const detailedRequests = await Promise.all(
      (connections || []).map(async (conn) => {
        const { data: senderProfile } = await supabase
          .from('extended_profiles')
          .select('*')
          .eq('id', conn.sender_id)
          .single();

        return {
          id: conn.id,
          created_at: conn.created_at,
          sender: senderProfile || {
            id: conn.sender_id,
            full_name: 'Anonymous Student',
            initials: '??',
            university: 'StudentBook University'
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      data: detailedRequests
    });
  } catch (error: any) {
    console.error('Error fetching incoming requests:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 3. Get outgoing pending connection requests
 * Route: GET /api/v1/connections/outgoing
 */
export const getOutgoingRequests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Query pending connection requests where current user is sender
    const { data: connections, error } = await supabase
      .from('connections')
      .select('*')
      .eq('sender_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch profile details for each receiver
    const detailedRequests = await Promise.all(
      (connections || []).map(async (conn) => {
        const { data: receiverProfile } = await supabase
          .from('extended_profiles')
          .select('*')
          .eq('id', conn.receiver_id)
          .single();

        return {
          id: conn.id,
          created_at: conn.created_at,
          receiver: receiverProfile || {
            id: conn.receiver_id,
            full_name: 'Anonymous Student',
            initials: '??',
            university: 'StudentBook University'
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      data: detailedRequests
    });
  } catch (error: any) {
    console.error('Error fetching outgoing requests:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 4. Accept or decline connection request
 * Route: PUT /api/v1/connections/respond
 */
export const respondToRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { requestId, status } = req.body; // status: 'accepted' | 'declined'

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!requestId || !status) {
      return res.status(400).json({ success: false, error: 'Request ID and status are required' });
    }

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid response status' });
    }

    // Fetch the connection request to verify ownership & status
    const { data: conn, error: fetchErr } = await supabase
      .from('connections')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchErr || !conn) {
      return res.status(404).json({ success: false, error: 'Connection request not found' });
    }

    // Security Check: Only the receiver can accept or decline the request
    if (conn.receiver_id !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: 'Forbidden: You are not authorized to respond to this request' 
      });
    }

    if (conn.status !== 'pending') {
      return res.status(400).json({ success: false, error: 'This request has already been processed' });
    }

    // Update connection status
    const { data: updatedConn, error: updateErr } = await supabase
      .from('connections')
      .update({ status })
      .eq('id', requestId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Fetch receiver's name for notification content
    const { data: receiverProfile } = await supabase
      .from('extended_profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    const receiverName = receiverProfile?.full_name || 'A classmate';

    // Create Notification & Activity
    if (status === 'accepted') {
      // Notify sender
      await supabase.from('notifications').insert({
        user_id: conn.sender_id,
        actor_id: userId,
        type: 'connection_accepted',
        content: `${receiverName} accepted your collaboration request!`
      });

      // Log activity
      await supabase.from('activities').insert({
        user_id: userId,
        action_type: 'connection_accepted',
        description: `Accepted collaboration request from ${conn.sender_id}`
      });

      // --- AUTO-CREATE CONVERSATION ---
      // Check if conversation already exists between the two users
      const { data: existingConvs } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId);
        
      let existingConvId = null;
      if (existingConvs && existingConvs.length > 0) {
        const convIds = existingConvs.map((c: any) => c.conversation_id);
        const { data: sharedConvs } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .in('conversation_id', convIds)
          .eq('user_id', conn.sender_id)
          .limit(1);
          
        if (sharedConvs && sharedConvs.length > 0) {
          existingConvId = sharedConvs[0].conversation_id;
        }
      }

      if (!existingConvId) {
        // Create new conversation
        const { data: newConv, error: convErr } = await supabase
          .from('conversations')
          .insert({})
          .select()
          .single();
          
        if (!convErr && newConv) {
          // Add both participants
          await supabase.from('conversation_participants').insert([
            { conversation_id: newConv.id, user_id: userId },
            { conversation_id: newConv.id, user_id: conn.sender_id }
          ]);
        } else {
          console.error('Failed to create conversation:', convErr);
        }
      }
      // --------------------------------
    }

    res.status(200).json({
      success: true,
      message: `Collaboration request successfully ${status}`,
      data: updatedConn
    });
  } catch (error: any) {
    console.error('Error responding to connection request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 5. Cancel outgoing connection request
 * Route: DELETE /api/v1/connections/request/:id
 */
export const cancelConnectionRequest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (!id) return res.status(400).json({ success: false, error: 'Request ID is required' });

    // Verify the request exists and belongs to the sender
    const { data: conn, error: fetchErr } = await supabase
      .from('connections')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !conn) return res.status(404).json({ success: false, error: 'Connection request not found' });
    if (conn.sender_id !== userId) return res.status(403).json({ success: false, error: 'Forbidden' });
    if (conn.status !== 'pending') return res.status(400).json({ success: false, error: 'Only pending requests can be cancelled' });

    // Delete the request
    const { error: deleteErr } = await supabase
      .from('connections')
      .delete()
      .eq('id', id);

    if (deleteErr) throw deleteErr;

    res.status(200).json({ success: true, message: 'Connection request cancelled successfully' });
  } catch (error: any) {
    console.error('Error cancelling connection request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

