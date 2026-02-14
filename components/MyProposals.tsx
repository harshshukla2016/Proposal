import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { ProposalData } from '../types';
import { deleteProposal, deleteMemory, updateMemoryCaption } from '../services/apiService';

interface UserProposal {
    id: string;
    token: string;
    partner_name: string;
    created_at: string;
    nebula_color: string;
    star_color: string;
    music_url: string;
    music_start_time: number;
    memory_count: number;
}

interface MyProposalsProps {
    userId: string;
    onClose: () => void;
}

export const MyProposals: React.FC<MyProposalsProps> = ({ userId, onClose }) => {
    const [proposals, setProposals] = useState<UserProposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
    const [memories, setMemories] = useState<any[]>([]);

    // State for editing memories
    const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
    const [editingCaption, setEditingCaption] = useState('');

    useEffect(() => {
        fetchUserProposals();
    }, [userId]);

    const fetchUserProposals = async () => {
        try {
            setLoading(true);

            // Fetch all proposals created by this user
            const { data: proposalsData, error: proposalsError } = await supabase
                .from('proposals')
                .select('*')
                .eq('creator_id', userId)
                .order('created_at', { ascending: false });

            if (proposalsError) throw proposalsError;

            // For each proposal, count the memories
            const proposalsWithCounts = await Promise.all(
                (proposalsData || []).map(async (proposal) => {
                    const { count } = await supabase
                        .from('memory_crystals')
                        .select('*', { count: 'exact', head: true })
                        .eq('proposal_id', proposal.id);

                    return {
                        ...proposal,
                        memory_count: count || 0
                    };
                })
            );

            setProposals(proposalsWithCounts);
        } catch (error: any) {
            console.error('Error fetching proposals:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchProposalMemories = async (proposalId: string) => {
        try {
            const { data: memoriesData, error } = await supabase
                .from('memory_crystals')
                .select('*')
                .eq('proposal_id', proposalId)
                .order('order_index', { ascending: true });

            if (error) throw error;
            setMemories(memoriesData || []);
            setSelectedProposal(proposalId);
        } catch (error: any) {
            console.error('Error fetching memories:', error.message);
        }
    };

    const handleDeleteProposal = async (e: React.MouseEvent, proposalId: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this proposal and all its memories? This cannot be undone.')) {
            const success = await deleteProposal(proposalId);
            if (success) {
                setProposals(prev => prev.filter(p => p.id !== proposalId));
                if (selectedProposal === proposalId) {
                    setSelectedProposal(null);
                    setMemories([]);
                }
            } else {
                alert('Failed to delete proposal.');
            }
        }
    };

    const handleDeleteMemory = async (memoryId: string) => {
        if (window.confirm('Delete this memory crystal?')) {
            const success = await deleteMemory(memoryId);
            if (success) {
                setMemories(prev => prev.filter(m => m.id !== memoryId));
                // Update proposal count in list
                setProposals(prev => prev.map(p =>
                    p.id === selectedProposal
                        ? { ...p, memory_count: p.memory_count - 1 }
                        : p
                ));
            } else {
                alert('Failed to delete memory.');
            }
        }
    };

    const handleUpdateMemory = async (memoryId: string) => {
        if (!editingCaption.trim()) return;

        const success = await updateMemoryCaption(memoryId, editingCaption);
        if (success) {
            setMemories(prev => prev.map(m =>
                m.id === memoryId ? { ...m, caption_text: editingCaption } : m
            ));
            setEditingMemoryId(null);
        } else {
            alert('Failed to update memory.');
        }
    };

    const copyToken = (token: string) => {
        navigator.clipboard.writeText(token);
        alert(`Token "${token}" copied to clipboard!`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 10000,
            overflow: 'auto',
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                backgroundColor: '#1a1a2e',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 0 50px rgba(255, 20, 147, 0.3)'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px',
                    borderBottom: '2px solid #ff1493',
                    paddingBottom: '20px'
                }}>
                    <h1 style={{
                        color: '#ff1493',
                        fontSize: '32px',
                        fontWeight: 'bold',
                        margin: 0
                    }}>
                        💖 My Proposals & Tokens
                    </h1>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#ff1493',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '50px',
                            height: '50px',
                            fontSize: '28px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            boxShadow: '0 0 15px rgba(255, 20, 147, 0.5)'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Loading State */}
                {loading && (
                    <div style={{ textAlign: 'center', color: '#fff', fontSize: '20px', padding: '50px' }}>
                        Loading your proposals...
                    </div>
                )}

                {/* Empty State */}
                {!loading && proposals.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        color: '#aaa',
                        fontSize: '18px',
                        padding: '50px',
                        backgroundColor: '#0f0f1e',
                        borderRadius: '15px'
                    }}>
                        <p style={{ fontSize: '48px', margin: '0 0 20px 0' }}>💔</p>
                        <p>You haven't created any proposals yet.</p>
                        <p style={{ fontSize: '14px', marginTop: '10px' }}>
                            Create your first romantic proposal to see it here!
                        </p>
                    </div>
                )}

                {/* Proposals List */}
                {!loading && proposals.length > 0 && (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {proposals.map((proposal) => (
                            <div
                                key={proposal.id}
                                style={{
                                    backgroundColor: '#0f0f1e',
                                    borderRadius: '15px',
                                    padding: '25px',
                                    border: selectedProposal === proposal.id ? '2px solid #ff1493' : '2px solid transparent',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                }}
                                onClick={() => fetchProposalMemories(proposal.id)}
                            >
                                {/* Proposal Header */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'start',
                                    marginBottom: '15px'
                                }}>
                                    <div>
                                        <h2 style={{
                                            color: '#fff',
                                            fontSize: '24px',
                                            margin: '0 0 10px 0'
                                        }}>
                                            For: {proposal.partner_name} 💕
                                        </h2>
                                        <p style={{
                                            color: '#888',
                                            fontSize: '14px',
                                            margin: 0
                                        }}>
                                            Created: {formatDate(proposal.created_at)}
                                        </p>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        gap: '10px',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{
                                            width: '30px',
                                            height: '30px',
                                            borderRadius: '50%',
                                            backgroundColor: proposal.nebula_color,
                                            border: '2px solid #fff',
                                            boxShadow: `0 0 10px ${proposal.nebula_color}`
                                        }} title="Nebula Color" />
                                        <div style={{
                                            width: '30px',
                                            height: '30px',
                                            borderRadius: '50%',
                                            backgroundColor: proposal.star_color,
                                            border: '2px solid #fff',
                                            boxShadow: `0 0 10px ${proposal.star_color}`
                                        }} title="Star Color" />
                                        <button
                                            onClick={(e) => handleDeleteProposal(e, proposal.id)}
                                            style={{
                                                background: '#441122',
                                                color: '#ff4444',
                                                border: '1px solid #ff4444',
                                                borderRadius: '8px',
                                                padding: '5px 10px',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                marginLeft: '15px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#662233'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#441122'}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Token Display */}
                                <div style={{
                                    backgroundColor: '#1a1a2e',
                                    borderRadius: '10px',
                                    padding: '15px',
                                    marginBottom: '15px',
                                    border: '1px solid #ff1493'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <p style={{
                                                color: '#888',
                                                fontSize: '12px',
                                                margin: '0 0 5px 0',
                                                textTransform: 'uppercase'
                                            }}>
                                                Access Token
                                            </p>
                                            <p style={{
                                                color: '#ffd700',
                                                fontSize: '24px',
                                                fontWeight: 'bold',
                                                margin: 0,
                                                fontFamily: 'monospace',
                                                letterSpacing: '2px'
                                            }}>
                                                {proposal.token}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                copyToken(proposal.token);
                                            }}
                                            style={{
                                                background: 'linear-gradient(135deg, #ff1493, #ff69b4)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '10px',
                                                padding: '12px 24px',
                                                fontSize: '14px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                boxShadow: '0 4px 15px rgba(255, 20, 147, 0.4)',
                                                transition: 'transform 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            📋 Copy Token
                                        </button>
                                    </div>
                                </div>

                                {/* Music Info */}
                                {proposal.music_url && (
                                    <div style={{
                                        backgroundColor: '#1a1a2e',
                                        borderRadius: '10px',
                                        padding: '10px 15px',
                                        marginBottom: '15px',
                                        border: '1px solid #3d1c4a',
                                        fontSize: '12px'
                                    }}>
                                        <div style={{ color: '#888', marginBottom: '4px', textTransform: 'uppercase', fontSize: '10px' }}>🎵 Music Info</div>
                                        <div style={{ color: '#ff69b4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            URL: <span style={{ color: '#aaa' }}>{proposal.music_url}</span>
                                        </div>
                                        <div style={{ color: '#ff69b4', marginTop: '2px' }}>
                                            Starts at: <span style={{ color: '#aaa' }}>{proposal.music_start_time}s</span>
                                        </div>
                                    </div>
                                )}

                                {/* Stats */}
                                <div style={{
                                    display: 'flex',
                                    gap: '15px',
                                    fontSize: '14px',
                                    color: '#aaa'
                                }}>
                                    <span>💎 {proposal.memory_count} Memories</span>
                                    <span>•</span>
                                    <span>🆔 ID: {proposal.id.substring(0, 8)}...</span>
                                </div>

                                {/* Memories Preview */}
                                {selectedProposal === proposal.id && memories.length > 0 && (
                                    <div style={{
                                        marginTop: '20px',
                                        paddingTop: '20px',
                                        borderTop: '1px solid #333'
                                    }}>
                                        <h3 style={{
                                            color: '#ff69b4',
                                            fontSize: '18px',
                                            marginBottom: '15px'
                                        }}>
                                            Memories ({memories.length})
                                        </h3>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                            gap: '15px'
                                        }}>
                                            {memories.map((memory, index) => (
                                                <div
                                                    key={memory.id}
                                                    style={{
                                                        backgroundColor: '#1a1a2e',
                                                        borderRadius: '10px',
                                                        padding: '10px',
                                                        border: '1px solid #333',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    {memory.image_url && (
                                                        <img
                                                            src={memory.image_url}
                                                            alt={memory.caption_text}
                                                            style={{
                                                                width: '100%',
                                                                height: '120px',
                                                                objectFit: 'cover',
                                                                borderRadius: '8px',
                                                                marginBottom: '8px'
                                                            }}
                                                        />
                                                    )}

                                                    {editingMemoryId === memory.id ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                            <input
                                                                value={editingCaption}
                                                                onChange={(e) => setEditingCaption(e.target.value)}
                                                                style={{
                                                                    backgroundColor: '#0f0f1e',
                                                                    border: '1px solid #ff1493',
                                                                    color: '#fff',
                                                                    borderRadius: '5px',
                                                                    padding: '5px',
                                                                    fontSize: '12px'
                                                                }}
                                                                autoFocus
                                                            />
                                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                                <button
                                                                    onClick={() => handleUpdateMemory(memory.id)}
                                                                    style={{ background: '#4ade80', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '10px', cursor: 'pointer' }}
                                                                >Save</button>
                                                                <button
                                                                    onClick={() => setEditingMemoryId(null)}
                                                                    style={{ background: '#ff4444', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '10px', cursor: 'pointer' }}
                                                                >Cancel</button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p style={{
                                                                color: '#fff',
                                                                fontSize: '12px',
                                                                margin: '0 0 5px 0',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                {memory.caption_text}
                                                            </p>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <p style={{
                                                                    color: memory.collected ? '#4ade80' : '#888',
                                                                    fontSize: '11px',
                                                                    margin: 0
                                                                }}>
                                                                    {memory.collected ? '✅ Collected' : '⏳ Pending'}
                                                                </p>
                                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingMemoryId(memory.id);
                                                                            setEditingCaption(memory.caption_text);
                                                                        }}
                                                                        style={{ background: 'none', border: 'none', color: '#ff69b4', cursor: 'pointer', fontSize: '12px' }}
                                                                        title="Edit Caption"
                                                                    >✏️</button>
                                                                    <button
                                                                        onClick={() => handleDeleteMemory(memory.id)}
                                                                        style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '12px' }}
                                                                        title="Delete Memory"
                                                                    >🗑️</button>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
