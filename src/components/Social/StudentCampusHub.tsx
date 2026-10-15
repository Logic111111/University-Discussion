import React, { useState } from 'react';
import { 
  Plus, Search, ThumbsUp, GitFork, BookMarked, MessageSquare, 
  Send, Sparkles, Cpu, Award, ExternalLink, Filter, TrendingUp, Users, ChevronDown, ChevronUp, Copy, Check
} from 'lucide-react';
import { StudentIdeaPost, Author } from '../../types';
import { CreateIdeaModal } from './CreateIdeaModal';

interface StudentCampusHubProps {
  currentUser: Author;
  ideas: StudentIdeaPost[];
  onAddIdea: (idea: StudentIdeaPost) => void;
  onOpenCiteModal: (title?: string, author?: string) => void;
  onOpenStudioWithTopic?: (title: string) => void;
}

export const StudentCampusHub: React.FC<StudentCampusHubProps> = ({
  currentUser,
  ideas,
  onAddIdea,
  onOpenCiteModal,
  onOpenStudioWithTopic,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedCodeId, setExpandedCodeId] = useState<string | null>(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Local state for interactive endorsements and forks
  const [localPosts, setLocalPosts] = useState<StudentIdeaPost[]>(ideas);

  // Keep synced if ideas prop updates
  React.useEffect(() => {
    setLocalPosts(ideas);
  }, [ideas]);

  const categories = [
    'All',
    'Power & Energy',
    'Robotics & Control',
    'Embedded & FPGA',
    'Aerospace & Avionics',
    'Quantum Computing',
  ];

  const filteredPosts = localPosts.filter((post) => {
    const matchDept =
      selectedDept === 'All' ||
      post.department.toLowerCase().includes(selectedDept.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(selectedDept.toLowerCase()));

    const matchQuery =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchDept && matchQuery;
  });

  const handleToggleEndorse = (postId: string) => {
    setLocalPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const wasEndorsed = post.hasEndorsed;
          return {
            ...post,
            hasEndorsed: !wasEndorsed,
            endorsements: wasEndorsed ? post.endorsements - 1 : post.endorsements + 1,
          };
        }
        return post;
      })
    );
  };

  const handleForkIdea = (post: StudentIdeaPost) => {
    setLocalPosts((prev) =>
      prev.map((p) => {
        if (p.id === post.id) {
          return {
            ...p,
            forks: p.forks + 1,
          };
        }
        return p;
      })
    );
    if (onOpenStudioWithTopic) {
      onOpenStudioWithTopic(post.title);
    }
  };

  const handleAddComment = (postId: string) => {
    if (!newCommentText.trim()) return;

    setLocalPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: `c_${Date.now()}`,
                author: currentUser,
                content: newCommentText.trim(),
                timestamp: 'Just now',
                verifiedStudentBadge: true,
              },
            ],
            peerReviewsCount: post.peerReviewsCount + 1,
          };
        }
        return post;
      })
    );

    setNewCommentText('');
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div className="flex-1 bg-[#090A0F] overflow-y-auto p-4 sm:p-6 lg:p-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Campus Network Hero Banner */}
        <div className="relative rounded-2xl glass-panel-glow p-6 sm:p-8 border border-cyan-500/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  NEXUS CAMPUS EXCHANGE • ACADEMIC YEAR 2026-2027
                </span>
                <span className="text-xs text-slate-500 font-mono">Global Mesh Active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-100 tracking-tight">
                Engineering Student Idea Exchange & Project Lab
              </h1>
              <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
                A decentralized academic social platform for engineering students to log hardware prototypes, share firmware algorithms, get peer-reviewed, and publish verified capstone research.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Log & Share Your Idea</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Department Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 text-xs font-mono">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedDept(cat)}
                className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all ${
                  selectedDept === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm shadow-cyan-500/20 font-semibold'
                    : 'bg-obsidian-900 text-slate-400 hover:text-slate-200 border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, authors, microcontrollers, tags..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-obsidian-900 border border-white/10 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:border-cyan-400 outline-none transition-colors"
            />
          </div>
        </div>

        {/* Main Feed Grid: 2 Columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Feed of Student Posts */}
          <div className="lg:col-span-2 space-y-6">
            {filteredPosts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl glass-panel border border-white/10 font-mono text-slate-400">
                No engineering projects found matching your search. Be the first to publish one!
              </div>
            ) : (
              filteredPosts.map((post) => {
                const isExpanded = expandedCodeId === post.id;
                const isCommentsOpen = activeCommentPostId === post.id;

                return (
                  <article
                    key={post.id}
                    className="rounded-2xl glass-panel-glow border border-white/10 hover:border-cyan-500/40 transition-all overflow-hidden"
                  >
                    {/* Post Author Bar */}
                    <div className="p-5 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-10 h-10 rounded-full border border-cyan-400/50 object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-100 text-sm font-sans">
                              {post.author.name}
                            </span>
                            <span className="text-xs text-cyan-400 font-mono">
                              {post.author.handle}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-mono font-semibold border border-cyan-500/30">
                              STUDENT VERIFIED
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 font-sans mt-0.5">
                            <span className="text-amber-400 font-semibold">{post.author.university}</span> • {post.department} • <span className="text-slate-500">{post.timestamp}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="px-2 py-0.5 rounded bg-obsidian-950 text-slate-400 border border-white/5">
                          {post.author.year}
                        </span>
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="p-5 space-y-4">
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-100 hover:text-cyan-300 transition-colors cursor-pointer">
                          {post.title}
                        </h2>
                        <p className="text-slate-300 text-xs sm:text-sm font-sans mt-2 leading-relaxed">
                          {post.abstract}
                        </p>
                      </div>

                      {/* Hardware Specs Grid */}
                      <div className="p-3.5 rounded-xl bg-obsidian-950 border border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Controller / Core</div>
                          <div className="text-cyan-300 font-bold truncate mt-0.5" title={post.hardwareSpecs.controller}>
                            {post.hardwareSpecs.controller}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Supply Voltage</div>
                          <div className="text-amber-300 font-bold mt-0.5">
                            {post.hardwareSpecs.supplyVoltage}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Clock / Freq</div>
                          <div className="text-purple-300 font-bold mt-0.5">
                            {post.hardwareSpecs.clockSpeed}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Efficiency / Metric</div>
                          <div className="text-emerald-300 font-bold mt-0.5">
                            {post.hardwareSpecs.efficiencyRating}
                          </div>
                        </div>
                      </div>

                      {/* Expandable Code Snippet */}
                      {post.sampleCodeSnippet && (
                        <div className="rounded-xl border border-white/10 overflow-hidden font-mono text-xs">
                          <button
                            onClick={() => setExpandedCodeId(isExpanded ? null : post.id)}
                            className="w-full px-4 py-2 bg-obsidian-900 hover:bg-obsidian-850 flex items-center justify-between text-slate-300 transition-colors"
                          >
                            <span className="flex items-center gap-2 text-cyan-400 font-semibold text-[11px]">
                              <Cpu className="w-3.5 h-3.5" />
                              <span>View {post.sampleCodeSnippet.language} Control Loop Snippet</span>
                            </span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>

                          {isExpanded && (
                            <div className="relative bg-[#06080D] p-3 text-[11px]">
                              <button
                                onClick={() => handleCopyCode(post.id, post.sampleCodeSnippet.code)}
                                className="absolute top-2 right-2 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 flex items-center gap-1 text-[10px]"
                              >
                                {copiedCodeId === post.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedCodeId === post.id ? 'Copied' : 'Copy'}</span>
                              </button>
                              <pre className="text-slate-300 overflow-x-auto leading-relaxed">
                                {post.sampleCodeSnippet.code}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Hashtags */}
                      <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded bg-obsidian-950 text-cyan-400/90 border border-cyan-500/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Social Interaction Action Bar */}
                    <div className="px-5 py-3 bg-obsidian-950 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        {/* Peer Endorse */}
                        <button
                          onClick={() => handleToggleEndorse(post.id)}
                          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                            post.hasEndorsed
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/20'
                              : 'bg-obsidian-900 text-slate-400 hover:text-slate-200 border border-white/10'
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${post.hasEndorsed ? 'fill-current text-cyan-400' : ''}`} />
                          <span>Endorse ({post.endorsements})</span>
                        </button>

                        {/* Cite This Idea */}
                        <button
                          onClick={() => onOpenCiteModal(post.title, post.author.name)}
                          className="px-3 py-1.5 rounded-lg bg-obsidian-900 hover:bg-obsidian-850 text-slate-300 border border-white/10 flex items-center gap-1.5 transition-colors"
                        >
                          <BookMarked className="w-3.5 h-3.5 text-amber-400" />
                          <span>Cite ({post.citations})</span>
                        </button>

                        {/* Fork to Lab */}
                        <button
                          onClick={() => handleForkIdea(post)}
                          className="px-3 py-1.5 rounded-lg bg-obsidian-900 hover:bg-obsidian-850 text-purple-300 border border-white/10 flex items-center gap-1.5 transition-colors"
                        >
                          <GitFork className="w-3.5 h-3.5 text-purple-400" />
                          <span>Fork to Lab ({post.forks})</span>
                        </button>
                      </div>

                      {/* Peer Reviews / Comments Toggle */}
                      <button
                        onClick={() => setActiveCommentPostId(isCommentsOpen ? null : post.id)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 flex items-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Peer Review ({post.comments.length})</span>
                      </button>
                    </div>

                    {/* Threaded Peer Review Comments Drawer */}
                    {isCommentsOpen && (
                      <div className="p-4 bg-obsidian-900/90 border-t border-white/10 space-y-3 font-mono text-xs">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                          <span>Student Technical Peer Reviews</span>
                          <span className="text-cyan-400">{post.comments.length} Comments</span>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                          {post.comments.length === 0 ? (
                            <div className="text-slate-500 italic text-[11px] py-2">
                              No peer reviews yet. Leave constructive feedback on schematics or code!
                            </div>
                          ) : (
                            post.comments.map((comment) => (
                              <div
                                key={comment.id}
                                className="p-2.5 rounded-lg bg-obsidian-950 border border-white/5 space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-200">{comment.author.name}</span>
                                    <span className="text-[10px] text-cyan-400">({comment.author.university})</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500">{comment.timestamp}</span>
                                </div>
                                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                                  {comment.content}
                                </p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Add Comment Input */}
                        <div className="flex gap-2 pt-2 border-t border-white/5">
                          <input
                            type="text"
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddComment(post.id);
                            }}
                            placeholder="Add your peer review observation, question on topology..."
                            className="flex-1 px-3 py-2 rounded-lg bg-obsidian-950 border border-white/10 text-slate-200 placeholder:text-slate-600 focus:border-cyan-400 outline-none text-xs"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-obsidian-950 font-bold flex items-center gap-1 transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>

          {/* Right Col: Campus Leaderboard & Activity Telemetry */}
          <div className="space-y-6">
            {/* Student Leaderboard */}
            <div className="p-5 rounded-2xl glass-panel-glow border border-white/10 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="font-bold text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>Top Cited Student Projects</span>
                </div>
                <span className="text-[10px] text-cyan-400">IEEE Mesh</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-obsidian-950 border border-white/5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0 border border-cyan-500/30 text-xs">
                    1
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-200 text-xs hover:text-cyan-300 cursor-pointer">
                      Xilinx UltraScale+ Cholesky Core
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                      Tariq Al-Mansoor • Stanford VLSI
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-cyan-400">
                      <span>312 Citations</span>
                      <span>•</span>
                      <span>54 Forks</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-obsidian-950 border border-white/5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0 border border-amber-500/30 text-xs">
                    2
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-200 text-xs hover:text-cyan-300 cursor-pointer">
                      2.5 kW GaN Microgrid Inverter
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                      Evelyn Chen • MIT Power Labs
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-amber-400">
                      <span>184 Citations</span>
                      <span>•</span>
                      <span>37 Forks</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-obsidian-950 border border-white/5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center shrink-0 border border-purple-500/30 text-xs">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-200 text-xs hover:text-cyan-300 cursor-pointer">
                      Whole-Body Bipedal MPC Gait Solver
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                      Maya Lin • CMU Robotics Institute
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-purple-400">
                      <span>96 Citations</span>
                      <span>•</span>
                      <span>28 Forks</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Campus Telemetry Stream */}
            <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="font-bold text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>Real-Time Campus Activity</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>

              <div className="space-y-3 text-[11px]">
                <div className="flex items-start gap-2.5 text-slate-300">
                  <span className="text-cyan-400 font-bold">@echen_power</span>
                  <span className="text-slate-400 font-sans">
                    updated GaN Inverter to <span className="text-cyan-300 font-mono">Build #409</span> (Edge CDN deployed)
                  </span>
                </div>

                <div className="flex items-start gap-2.5 text-slate-300">
                  <span className="text-amber-400 font-bold">@sjenkins_fsae</span>
                  <span className="text-slate-400 font-sans">
                    shared Michigan Formula SAE 48V buck-boost BOM
                  </span>
                </div>

                <div className="flex items-start gap-2.5 text-slate-300">
                  <span className="text-purple-400 font-bold">@tariq_vlsi</span>
                  <span className="text-slate-400 font-sans">
                    approved Verilog timing closure for Artix-7
                  </span>
                </div>

                <div className="flex items-start gap-2.5 text-slate-300">
                  <span className="text-emerald-400 font-bold">@arjun_qubit</span>
                  <span className="text-slate-400 font-sans">
                    passed cryogenic noise test (0.8 quanta @ 6.5GHz)
                  </span>
                </div>
              </div>
            </div>

            {/* University Capstone Showcase Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-obsidian-950 border border-cyan-500/30 font-mono text-xs space-y-3">
              <div className="text-cyan-400 font-bold flex items-center gap-1.5 uppercase tracking-wider">
                <Award className="w-4 h-4" />
                <span>Capstone Season 2026</span>
              </div>
              <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
                Publishing your thesis or design project on NexusEng gives you permanent DOI registration, peer review attribution, and automated IEEE export.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/30 font-bold text-center block transition-colors"
              >
                Submit Capstone Draft →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Idea Creation Modal */}
      <CreateIdeaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={currentUser}
        onSubmitIdea={onAddIdea}
      />
    </div>
  );
};
