'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Briefcase, 
  BookOpen, 
  Tag, 
  RefreshCw, 
  AlertCircle,
  Mail,
  ChevronRight,
  TrendingUp,
  Clock,
  Sparkles,
  Inbox,
  CreditCard,
  DollarSign,
  Wallet,
  CalendarDays,
  Activity,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const CATEGORY_COLORS: Record<string, string> = {
  Subscription: '#f59e0b',
  Orders: '#3b82f6',
  Work: '#10b981',
  Study: '#8b5cf6',
  Promotions: '#ef4444',
  Social: '#ec4899',
  Other: '#64748b',
};

const CATEGORY_ICONS: Record<string, any> = {
  Subscription: <CreditCard className="w-5 h-5 text-amber-500" />,
  Orders: <ShoppingBag className="w-5 h-5 text-blue-500" />,
  Work: <Briefcase className="w-5 h-5 text-emerald-500" />,
  Study: <BookOpen className="w-5 h-5 text-amber-500" />,
  Promotions: <Tag className="w-5 h-5 text-red-500" />,
  Social: <Mail className="w-5 h-5 text-violet-500" />,
  Other: <AlertCircle className="w-5 h-5 text-slate-400" />,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

export default function Dashboard() {
  const { data, error, isLoading, mutate } = useSWR('/api/gmail', fetcher, {
    refreshInterval: 300000,
    revalidateOnFocus: true,
  });

  const { data: expenseData, isLoading: isLoadingExpenses } = useSWR('/api/expenses', fetcher);

  const [activeTab, setActiveTab] = useState('all');
  const [showExpenses, setShowExpenses] = useState(false);

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white p-6">
      <Card className="max-w-md glass border-red-500/50">
        <CardContent className="pt-6 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold font-mono text-glow">SYSTEM FAILURE</h2>
          <p className="text-slate-400">Node-X connection lost. Authenticate GWS services.</p>
          <button onClick={() => mutate()} className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-full transition-all active:scale-95 text-sm font-bold">REBOOT SYSTEM</button>
        </CardContent>
      </Card>
    </div>
  );

  const filteredEmails = activeTab === 'all' 
    ? data?.emails 
    : data?.emails.filter((e: any) => e.category === activeTab);

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[150px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4 cursor-pointer group"
            onClick={() => setShowExpenses(false)}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
              <div className="relative w-11 h-11 bg-black rounded-xl flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 transition-all">
                <Zap className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter font-mono text-white leading-none">INSIGHTS<span className="text-blue-500 italic">.OS</span></h1>
              <div className="flex items-center mt-1">
                <span className="flex h-2 w-2 relative mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-black">Secure Data Stream</p>
              </div>
            </div>
          </motion.div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowExpenses(!showExpenses)} 
              className={`flex items-center space-x-2 px-6 py-2.5 border rounded-full transition-all active:scale-95 shadow-lg ${showExpenses ? 'bg-amber-500 border-amber-400 text-black shadow-amber-500/20' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'}`}
            >
              <Wallet className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Finance Radar</span>
            </button>
            <button 
              onClick={() => mutate()} 
              disabled={isLoading}
              className="group flex items-center space-x-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-slate-400 group-hover:text-white ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white hidden sm:inline">Sync</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8 relative z-10">
        
        {showExpenses ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Top row financial metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <Card className="glass border-white/5 h-full">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-sm font-mono uppercase tracking-widest text-slate-400">Spending Forecast 2026</CardTitle>
                      <CardDescription className="text-slate-500">Monthly evolution and future projections</CardDescription>
                    </div>
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-amber-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="h-[300px] mt-4">
                    {isLoadingExpenses ? (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-sm animate-pulse">Scanning ledgers...</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={expenseData?.monthlyStats}>
                          <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                          <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontFamily: 'monospace' }}
                            itemStyle={{ color: '#fbbf24' }}
                          />
                          <Area type="monotone" dataKey="total" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                          <Area type="monotone" dataKey="forecast" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-6">
                <Card className="glass border-white/5 bg-gradient-to-br from-amber-500/10 to-transparent">
                  <CardContent className="p-8 flex flex-col items-center justify-center space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/70">Annual Burn</p>
                    <p className="text-6xl font-black font-mono text-white text-glow">${expenseData?.totalSpent || 0}</p>
                    <Badge variant="outline" className="mt-4 border-amber-500/20 text-amber-400 bg-amber-500/5 px-4 py-1">TOTAL 2026</Badge>
                  </CardContent>
                </Card>

                <Card className="glass border-white/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Monthly Pulse</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-black font-mono">${expenseData?.burnRate || 0}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Cost of digital life</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center text-red-400 text-xs font-bold">
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                          +102%
                        </div>
                        <p className="text-[9px] text-slate-600 uppercase font-black">Est. JUN 2026</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Health Radar Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {expenseData?.subscriptions?.map((sub: any) => (
                <Card key={sub.provider} className={`glass-hover border-white/5 overflow-hidden relative group transition-all duration-500 ${sub.status === 'Failed' ? 'bg-red-500/5 border-red-500/20 ring-1 ring-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : ''}`}>
                  {sub.status === 'Failed' && <div className="absolute top-0 right-0 p-2"><AlertCircle className="w-4 h-4 text-red-500 animate-pulse" /></div>}
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2 rounded-lg ${sub.status === 'Active' ? 'bg-emerald-500/10' : sub.status === 'Canceled' ? 'bg-slate-500/10' : 'bg-red-500/10'}`}>
                        {sub.status === 'Active' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : sub.status === 'Canceled' ? <XCircle className="w-4 h-4 text-slate-500" /> : <Activity className="w-4 h-4 text-red-500" />}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">Día {sub.day}</span>
                    </div>
                    <h3 className="font-black font-mono text-sm uppercase tracking-tight truncate text-white">{sub.provider}</h3>
                    <div className="mt-4 flex items-baseline justify-between">
                      <p className={`text-2xl font-black font-mono ${sub.status === 'Failed' ? 'text-red-400' : 'text-white'}`}>${sub.amount || '--'}</p>
                      <Badge variant="outline" className={`text-[8px] uppercase font-black tracking-widest ${sub.status === 'Active' ? 'text-emerald-400 border-emerald-500/20' : sub.status === 'Canceled' ? 'text-slate-500 border-slate-500/20' : 'text-red-400 border-red-500/20'}`}>
                        {sub.status}
                      </Badge>
                    </div>
                    {/* Progress to next bill */}
                    <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: sub.status === 'Active' ? '65%' : '0%' }}
                        className={`h-full ${sub.status === 'Active' ? 'bg-blue-500' : 'bg-slate-700'}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          /* Normal Dashboard View */
          <>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4"
            >
              {/* Main Distribution Card */}
              <motion.div variants={itemVariants} className="md:col-span-2 md:row-span-2">
                <Card className="h-full glass border-white/5 overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-mono tracking-widest uppercase flex items-center text-slate-400">
                        <Activity className="w-4 h-4 mr-2 text-blue-500" />
                        Traffic Distribution
                      </CardTitle>
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] font-black uppercase tracking-tighter">Live Scan</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[350px] relative">
                    {isLoading ? (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-sm animate-pulse">Decoding stream...</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data?.stats.categories}
                            innerRadius={85}
                            outerRadius={115}
                            paddingAngle={10}
                            dataKey="value"
                            stroke="none"
                          >
                            {data?.stats.categories.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#ccc'} className="hover:opacity-80 transition-opacity cursor-pointer filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                            itemStyle={{ color: '#fff', fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-4">
                      <span className="text-5xl font-black font-mono text-white text-glow">{data?.emails?.length || 0}</span>
                      <span className="text-[10px] uppercase text-slate-500 font-black tracking-[0.3em] mt-1">Packets</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Bento Items */}
              {[
                { label: 'Purchases', key: 'Orders', icon: <ShoppingBag />, color: "from-blue-500/20" },
                { label: 'Career', key: 'Work', icon: <Briefcase />, color: "from-emerald-500/20" },
                { label: 'Academy', key: 'Study', icon: <BookOpen />, color: "from-purple-500/20" },
                { label: 'Finance', key: 'Subscription', icon: <CreditCard />, color: "from-amber-500/20" }
              ].map((stat) => (
                <motion.div key={stat.label} variants={itemVariants}>
                  <Card className="glass-hover border-white/5 h-full group cursor-pointer overflow-hidden">
                    <CardContent className="p-6 flex flex-col justify-between h-full relative">
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${stat.color} to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
                      <div className="flex items-center justify-between relative z-10">
                        <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 group-hover:border-white/20 transition-all text-slate-400 group-hover:text-white">
                          {React.cloneElement(stat.icon as React.ReactElement, { className: "w-5 h-5" })}
                        </div>
                        <div className="h-1 w-6 bg-white/10 rounded-full group-hover:w-10 group-hover:bg-blue-500 transition-all duration-500"></div>
                      </div>
                      <div className="mt-4 relative z-10">
                        <div className="text-4xl font-black font-mono text-white tracking-tighter group-hover:scale-105 transition-transform origin-left">
                          {isLoading ? '..' : data?.summary[stat.key] || 0}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1 group-hover:text-slate-300 transition-colors">{stat.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Feed Section */}
            <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-12 glass border-white/5">
                <CardHeader className="flex flex-col sm:flex-row items-center justify-between border-b border-white/5 pb-6">
                  <div>
                    <CardTitle className="text-sm font-mono uppercase tracking-[0.2em] flex items-center text-white">
                      <Activity className="w-4 h-4 mr-3 text-blue-400 animate-pulse" />
                      Live Activity Feed
                    </CardTitle>
                  </div>
                  <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full sm:w-auto">
                    <TabsList className="bg-white/5 border border-white/5 p-1 rounded-full h-10 w-full sm:w-auto">
                      {['all', 'Subscription', 'Orders', 'Work'].map(t => (
                        <TabsTrigger key={t} value={t} className="rounded-full px-4 text-[9px] uppercase font-black tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                          {t}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="popLayout">
                      {filteredEmails?.map((email: any) => (
                        <motion.a
                          key={email.id}
                          href={`https://mail.google.com/mail/u/0/#all/${email.threadId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="group flex items-start space-x-5 p-5 hover:bg-white/[0.02] transition-all cursor-pointer"
                        >
                          <div className="mt-1 p-2 bg-white/5 rounded-lg border border-white/5 group-hover:border-blue-500/30 transition-all">
                            {CATEGORY_ICONS[email.category]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-3 truncate">
                                <p className="text-xs font-black font-mono text-white truncate group-hover:text-blue-400 transition-colors uppercase tracking-tight">{email.from}</p>
                                {email.amount && <Badge className="bg-blue-500/10 text-blue-400 border-none text-[9px] font-black">{email.amount}</Badge>}
                              </div>
                              <span className="text-[10px] font-mono text-slate-600 whitespace-nowrap">{email.date.split(',')[1]?.split(' ')[1] || 'REC'}</span>
                            </div>
                            <h3 className="text-xs font-bold text-slate-300 truncate mb-1">{email.subject}</h3>
                            <p className="text-[10px] text-slate-500 line-clamp-1 font-medium">{email.snippet}</p>
                          </div>
                        </motion.a>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          </>
        )}

        {/* System Footer */}
        <footer className="flex flex-col sm:flex-row items-center justify-between py-12 text-slate-700 text-[9px] uppercase font-black tracking-[0.3em] gap-4 opacity-40">
          <div className="flex items-center space-x-8">
            <p>GMAIL.INSIGHTS // RODRIGO PAZ</p>
            <span className="w-1 h-1 bg-slate-800 rounded-full" />
            <p>BUILD 2.4.0-STABLE</p>
          </div>
          <p className="flex items-center">
            {data?.lastUpdated ? `LAST_SYNC: ${new Date(data.lastUpdated).toLocaleTimeString()}` : 'INITIALIZING_STREAM...'}
          </p>
        </footer>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.2); }
        .text-glow { text-shadow: 0 0 15px rgba(59, 130, 246, 0.5); }
      `}</style>
    </div>
  );
}
