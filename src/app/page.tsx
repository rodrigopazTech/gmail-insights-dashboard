'use client';

import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock
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
  BarChart, 
  Bar, 
  XAxis, 
  YAxis,
  Legend
} from 'recharts';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const CATEGORY_COLORS: Record<string, string> = {
  Orders: '#3b82f6', // blue-500
  Work: '#10b981',   // emerald-500
  Study: '#f59e0b',  // amber-500
  Promotions: '#ef4444', // red-500
  Social: '#8b5cf6', // violet-500
  Other: '#6b7280',  // gray-500
};

const CATEGORY_ICONS: Record<string, any> = {
  Orders: <ShoppingBag className="w-5 h-5 text-blue-500" />,
  Work: <Briefcase className="w-5 h-5 text-emerald-500" />,
  Study: <BookOpen className="w-5 h-5 text-amber-500" />,
  Promotions: <Tag className="w-5 h-5 text-red-500" />,
  Social: <Mail className="w-5 h-5 text-violet-500" />,
  Other: <AlertCircle className="w-5 h-5 text-gray-500" />,
};

export default function Dashboard() {
  const { data, error, isLoading, mutate } = useSWR('/api/gmail', fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
    revalidateOnFocus: true,
  });

  const [activeTab, setActiveTab] = useState('all');

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-950 text-white p-6">
      <Card className="max-w-md bg-neutral-900 border-neutral-800">
        <CardContent className="pt-6 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">Error de Conexión</h2>
          <p className="text-neutral-400">No pudimos conectar con la API de Gmail. Asegúrate de que GWS esté configurado correctamente.</p>
          <button onClick={() => mutate()} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors">Reintentar</button>
        </CardContent>
      </Card>
    </div>
  );

  const filteredEmails = activeTab === 'all' 
    ? data?.emails 
    : data?.emails.filter((e: any) => e.category === activeTab);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/60 border-b border-neutral-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Gmail Insights</h1>
              <p className="text-xs text-neutral-400 flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
                Live Dashboard
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => mutate()} 
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-sm hidden sm:inline">Refrescar</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Orders', key: 'Orders', icon: <ShoppingBag className="text-blue-500" /> },
            { label: 'Work', key: 'Work', icon: <Briefcase className="text-emerald-500" /> },
            { label: 'Study', key: 'Study', icon: <BookOpen className="text-amber-500" /> },
            { label: 'Important', key: 'Other', icon: <AlertCircle className="text-neutral-500" /> }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-neutral-800 rounded-lg">{stat.icon}</div>
                    <Badge variant="outline" className="text-xs border-neutral-700 text-neutral-400">Total</Badge>
                  </div>
                  <div className="text-3xl font-black mt-2">
                    {isLoading ? '...' : data?.summary[stat.key] || 0}
                  </div>
                  <p className="text-neutral-400 text-sm mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        {/* Visual Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-lg">Distribución</CardTitle>
              <CardDescription>Categorización de correos recientes</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center text-neutral-500">Analizando...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.stats.categories}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data?.stats.categories.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#ccc'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-neutral-900 border-neutral-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Actividad Reciente</CardTitle>
                <CardDescription>Últimos correos detectados</CardDescription>
              </div>
              <Clock className="w-5 h-5 text-neutral-600" />
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" onValueChange={setActiveTab}>
                <TabsList className="bg-neutral-800 border-neutral-700 mb-4 overflow-x-auto">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="Orders">Compras</TabsTrigger>
                  <TabsTrigger value="Work">Trabajo</TabsTrigger>
                  <TabsTrigger value="Study">Estudio</TabsTrigger>
                </TabsList>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-20 bg-neutral-800/50 rounded-xl animate-pulse" />
                    ))
                  ) : filteredEmails?.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500">No se encontraron correos en esta categoría.</div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {filteredEmails?.map((email: any) => (
                        <motion.div
                          key={email.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="group flex items-start space-x-4 p-4 bg-neutral-950/50 hover:bg-neutral-800/50 border border-neutral-800/50 rounded-xl transition-all cursor-default"
                        >
                          <div className="mt-1">{CATEGORY_ICONS[email.category]}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold truncate pr-4">{email.from}</p>
                              <span className="text-[10px] text-neutral-500 whitespace-nowrap">{email.date.split(',')[1]?.split(' ')[1] || 'Reciente'}</span>
                            </div>
                            <h3 className="text-sm text-neutral-300 truncate mb-1">{email.subject}</h3>
                            <p className="text-xs text-neutral-500 line-clamp-1">{email.snippet}</p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="w-4 h-4 text-neutral-600" />
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Footer info */}
        <footer className="flex flex-col sm:flex-row items-center justify-between py-6 border-t border-neutral-900 text-neutral-500 text-xs gap-4">
          <div className="flex items-center space-x-4">
            <p>© 2026 Rodrigo Paz</p>
            <span className="w-1 h-1 bg-neutral-800 rounded-full" />
            <p>Conectado vía GWS API</p>
          </div>
          <p className="flex items-center">
            Última sincronización: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : 'N/A'}
          </p>
        </footer>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0a0a0a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #262626;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #404040;
        }
      `}</style>
    </div>
  );
}
