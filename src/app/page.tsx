'use client';

import React, { useState, useMemo } from 'react';
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
  Zap,
  Filter,
  Package,
  Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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

const MONTHS = ['TODOS', 'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

export default function Dashboard() {
  const { data, error, isLoading, mutate } = useSWR('/api/gmail', fetcher, { refreshInterval: 300000 });
  const { data: financeData, isLoading: isLoadingFinance } = useSWR('/api/expenses', fetcher);

  const [activeTab, setActiveTab] = useState('all');
  const [showExpenses, setShowExpenses] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('TODOS');

  const filteredFinance = useMemo(() => {
    if (!financeData) return { subscriptions: [], products: [] };
    
    const filterByMonth = (list: any[]) => {
      const safeList = list || [];
      return selectedMonth === 'TODOS' 
        ? safeList 
        : safeList.filter(item => item.month.includes(selectedMonth));
    };

    return {
      subscriptions: filterByMonth(financeData.subscriptions),
      products: filterByMonth(financeData.products)
    };
  }, [financeData, selectedMonth]);

  const totalMonthlySpent = useMemo(() => {
    const products = filteredFinance?.products || [];
    const subs = filteredFinance?.subscriptions || [];
    
    const total = products.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0) +
                  subs.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
    return total.toFixed(2);
  }, [filteredFinance]);

  if (error) return <div className="p-20 text-center text-red-500 font-mono">ERROR_CRITICAL: API_CONNECTION_FAILED</div>;

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[150px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/60 border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setShowExpenses(false)}>
            <div className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter font-mono text-white leading-none">INSIGHTS<span className="text-blue-500">.OS</span></h1>
              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-black mt-1">Live Financial Intel</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowExpenses(!showExpenses)} 
              className={`flex items-center space-x-2 px-6 py-2.5 border rounded-full transition-all active:scale-95 ${showExpenses ? 'bg-amber-500 border-amber-400 text-black shadow-lg shadow-amber-500/20' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
            >
              <Wallet className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">{showExpenses ? 'Exit Finance' : 'Finance Radar'}</span>
            </button>
            <button onClick={() => mutate()} className="p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/10">
              <RefreshCw className={`w-4 h-4 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8 relative z-10">
        
        {showExpenses ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            
            {/* Global Month Filter */}
            <div className="flex items-center justify-between bg-white/5 p-2 rounded-full border border-white/5 overflow-x-auto no-scrollbar">
              <div className="flex items-center px-4 border-r border-white/10 mr-2">
                <Filter className="w-3 h-3 text-slate-500 mr-2" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Filtrar Mes</span>
              </div>
              <div className="flex space-x-1">
                {MONTHS.map(m => (
                  <button 
                    key={m} 
                    onClick={() => setSelectedMonth(m)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${selectedMonth === m ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="glass border-white/5 bg-gradient-to-br from-blue-500/10 to-transparent">
                <CardContent className="p-6">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400/70 mb-1">Gasto Total ({selectedMonth})</p>
                  <p className="text-4xl font-black font-mono text-white">${totalMonthlySpent}</p>
                </CardContent>
              </Card>
              <Card className="glass border-white/5">
                <CardContent className="p-6">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Suscripciones</p>
                  <p className="text-2xl font-black font-mono text-amber-500">{filteredFinance?.subscriptions?.length || 0}</p>
                </CardContent>
              </Card>
              <Card className="glass border-white/5">
                <CardContent className="p-6">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Productos</p>
                  <p className="text-2xl font-black font-mono text-emerald-500">{filteredFinance?.products?.length || 0}</p>
                </CardContent>
              </Card>
              <Card className="glass border-white/5">
                <CardContent className="p-6">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Items Totales</p>
                  <p className="text-2xl font-black font-mono text-white">{(filteredFinance?.subscriptions?.length || 0) + (filteredFinance?.products?.length || 0)}</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="subscriptions" className="w-full">
              <TabsList className="bg-white/5 border border-white/5 p-1 rounded-xl h-14 w-full md:w-auto">
                <TabsTrigger value="subscriptions" className="rounded-lg px-8 h-full text-xs font-black uppercase tracking-widest data-[state=active]:bg-amber-500 data-[state=active]:text-black">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Subscriptions
                </TabsTrigger>
                <TabsTrigger value="products" className="rounded-lg px-8 h-full text-xs font-black uppercase tracking-widest data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  <Package className="w-4 h-4 mr-2" />
                  E-Commerce Orders
                </TabsTrigger>
              </TabsList>

              <TabsContent value="subscriptions" className="mt-6">
                <Card className="glass border-white/5 overflow-hidden">
                  <CardHeader className="border-b border-white/5 pb-6">
                    <CardTitle className="text-sm font-mono uppercase tracking-[0.2em] text-amber-500 flex items-center">
                      <Activity className="w-4 h-4 mr-2" />
                      Recurring Subscription Matrix
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isLoadingFinance ? (
                      <div className="p-20 text-center text-slate-500 font-mono animate-pulse">Decrypting Subscription Data...</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono text-sm">
                          <thead className="bg-white/5 text-[10px] uppercase text-slate-500 tracking-widest">
                            <tr>
                              <th className="p-6">Service Provider</th>
                              <th className="p-6">Billing Day</th>
                              <th className="p-6 text-right">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {filteredFinance?.subscriptions?.map((sub: any) => (
                              <tr key={sub.id} className="group hover:bg-white/[0.02] transition-colors">
                                <td className="p-6 font-bold text-white uppercase tracking-tight">{sub.provider}</td>
                                <td className="p-6 text-slate-400">EVERY DAY {sub.day}</td>
                                <td className="p-6 text-right font-black text-amber-400">${sub.amount || '--'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="products" className="mt-6">
                <Card className="glass border-white/5 overflow-hidden">
                  <CardHeader className="border-b border-white/5 pb-6">
                    <CardTitle className="text-sm font-mono uppercase tracking-[0.2em] text-blue-400 flex items-center">
                      <Package className="w-4 h-4 mr-2" />
                      Product Purchase History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono text-sm">
                        <thead className="bg-white/5 text-[10px] uppercase text-slate-500 tracking-widest">
                          <tr>
                            <th className="p-6">Merchant</th>
                            <th className="p-6">Item / Order ID</th>
                            <th className="p-6">Date</th>
                            <th className="p-6 text-right">Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredFinance?.products?.map((prod: any) => (
                            <tr key={prod.id} className="group hover:bg-white/[0.02] transition-colors">
                              <td className="p-6 font-bold text-white uppercase">{prod.provider}</td>
                              <td className="p-6 text-slate-400 max-w-xs truncate">{prod.subject}</td>
                              <td className="p-6 text-slate-500 text-xs">{new Date(prod.date).toLocaleDateString()}</td>
                              <td className="p-6 text-right font-black text-emerald-400">${prod.amount || '0.00'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        ) : (
          /* Normal Inbox Dashboard */
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Reuse the Bento Grid items from previous iteration, simplified for space */}
              {['Orders', 'Work', 'Study', 'Subscription'].map((k, i) => (
                <Card key={k} className="glass border-white/5 p-6 group hover:border-blue-500/30 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 bg-white/5 rounded-xl">{CATEGORY_ICONS[k]}</div>
                    <Badge className="bg-white/5 text-slate-500 border-none text-[8px] font-black">7D SCAN</Badge>
                  </div>
                  <p className="text-4xl font-black font-mono text-white tracking-tighter">{data?.summary[k] || 0}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">{k}</p>
                </Card>
              ))}
            </motion.div>

            <Card className="glass border-white/5 mt-8">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-xs font-mono uppercase tracking-[0.3em] flex items-center text-slate-400">
                  <Activity className="w-4 h-4 mr-3 text-blue-500" />
                  Neural Network Activity Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 max-h-[500px] overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                  {data?.emails?.map((email: any) => (
                    <motion.a 
                      key={email.id} 
                      href={`https://mail.google.com/mail/u/0/#all/${email.threadId}`}
                      target="_blank"
                      className="flex items-start p-5 hover:bg-white/[0.02] border-b border-white/5 last:border-0"
                    >
                      <div className="mt-1 p-2 bg-white/5 rounded-lg mr-4">{CATEGORY_ICONS[email.category]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-black font-mono text-white uppercase truncate pr-4">{email.from}</p>
                          <span className="text-[9px] font-mono text-slate-600">{email.date.split(',')[1]?.split(' ')[1]}</span>
                        </div>
                        <p className="text-xs text-slate-300 truncate font-medium">{email.subject}</p>
                      </div>
                    </motion.a>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>
          </>
        )}

        {/* System Footer */}
        <footer className="flex items-center justify-between py-12 text-slate-700 text-[9px] uppercase font-black tracking-[0.3em] opacity-40">
          <p>INSIGHTS.OS // RODRIGO PAZ</p>
          <p>{data?.lastUpdated ? `SYNC_OK: ${new Date(data.lastUpdated).toLocaleTimeString()}` : 'INITIALIZING...'}</p>
        </footer>
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
      `}</style>
    </div>
  );
}
