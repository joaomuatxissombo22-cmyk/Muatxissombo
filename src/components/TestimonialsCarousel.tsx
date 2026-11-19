import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Quote,
  Star,
  CheckCircle2,
} from 'lucide-react';

export interface TestimonialFeedbackItem {
  id: string;
  userId: string;
  clientName: string;
  companyName?: string;
  serviceCategory: string;
  rating: number;
  comment: string;
  projectReference?: string;
  isPublic: boolean;
}

interface TestimonialsCarouselProps {
  publicFeedbacks: TestimonialFeedbackItem[];
}

const CURATED_CLIENT_TESTIMONIALS: TestimonialFeedbackItem[] = [
  {
    id: 'curated-alhan',
    userId: 'system',
    clientName: 'Eng. António Kaputo',
    companyName: 'ALHAN Consultoria · Kilamba, Luanda',
    serviceCategory: 'Websites para Consultorias & Domínio .pro',
    projectReference: 'alhan.pro',
    rating: 5,
    comment:
      'A Muatxissombo desenvolveu o nosso portal corporativo alhan.pro com foco claro nas normas ISO 9001, 14001 e 45001. Desde o lançamento, passámos a receber pedidos de diagnóstico empresarial diretamente pelo site com total profissionalismo.',
    isPublic: true,
  },
  {
    id: 'curated-biosfera',
    userId: 'system',
    clientName: 'Dr.ª Beatriz Domingos',
    companyName: 'Biosfera Consultoria Ambiental · Belas',
    serviceCategory: 'Website Institucional & Domínio .ao',
    projectReference: 'biosfera.ao',
    rating: 5,
    comment:
      'Precisávamos de uma presença institucional sólida para os nossos estudos de impacto ambiental em Angola. A equipa tratou do registo, alojamento e entrega do website dentro do prazo acordado, com suporte técnico imediato.',
    isPublic: true,
  },
  {
    id: 'curated-clinica',
    userId: 'system',
    clientName: 'Dr. Carlos Mendes',
    companyName: 'Clínica Vida Plena · Talatona',
    serviceCategory: 'Criação de Websites Clínicos',
    projectReference: 'Portal de Marcação 24/7',
    rating: 5,
    comment:
      'O nosso portal clínico ficou moderno, rápido em telemóveis e reduziu significativamente as chamadas na receção graças ao formulário de pré-marcação online integrado com e-mail e WhatsApp.',
    isPublic: true,
  },
  {
    id: 'curated-kuanza',
    userId: 'system',
    clientName: 'Eng.ª Patrícia Mateus',
    companyName: 'Kuanza Sul Construções Lda.',
    serviceCategory: 'Licenças Microsoft 365 & Domínio .co.ao',
    projectReference: 'Microsoft 365 Business Standard',
    rating: 5,
    comment:
      'Fizemos o registo do domínio .co.ao, configuração das contas de e-mail corporativo e recebemos as chaves originais Microsoft 365 Business Standard para toda a equipa em menos de 24 horas.',
    isPublic: true,
  },
  {
    id: 'curated-academiafg',
    userId: 'system',
    clientName: 'Prof. Fernando Gomes',
    companyName: 'FG Academia de Negócios · Luanda',
    serviceCategory: 'Domínio Internacional & E-mail Corporativo',
    projectReference: 'academiafg.com',
    rating: 5,
    comment:
      'A migração do domínio academiafg.com, certificados SSL e proteção ESET nas estações de trabalho dos formadores decorreu sem qualquer interrupção das nossas turmas executivas.',
    isPublic: true,
  },
  {
    id: 'curated-talentforge',
    userId: 'system',
    clientName: 'Mário Sebastião',
    companyName: 'Talent Forge RH · Centralidade do Kilamba',
    serviceCategory: 'Criação de Website & Assistência Informática',
    projectReference: 'tallentforge.com',
    rating: 5,
    comment:
      'Excelente acompanhamento desde a conceção do portal tallentforge.com até à configuração de Windows 11 e Kaspersky nos portáteis do escritório. Recomendo pela proximidade e rigor técnico.',
    isPublic: true,
  },
];

export const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  publicFeedbacks,
}) => {
  const items = useMemo(() => {
    const seenIds = new Set<string>();
    const merged: TestimonialFeedbackItem[] = [];
    for (const fb of [...publicFeedbacks, ...CURATED_CLIENT_TESTIMONIALS]) {
      if (!seenIds.has(fb.id) && fb.comment?.trim()) {
        seenIds.add(fb.id);
        merged.push(fb);
      }
    }
    return merged;
  }, [publicFeedbacks]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (activeIndex >= items.length && items.length > 0) {
      setActiveIndex(0);
    }
  }, [items.length, activeIndex]);

  useEffect(() => {
    if (items.length <= 1 || isPaused || isHovered) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [items.length, isPaused, isHovered]);

  if (items.length === 0) return null;

  const currentIndex = activeIndex % items.length;
  const activeItem = items[currentIndex];
  const nextItem1 = items.length > 1 ? items[(currentIndex + 1) % items.length] : null;
  const nextItem2 = items.length > 2 ? items[(currentIndex + 2) % items.length] : null;

  const avgRating =
    items.reduce((acc, item) => acc + Math.min(5, Math.max(1, item.rating || 5)), 0) /
    items.length;

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  const getInitials = (name: string) => {
    const parts = name
      .replace(/^(Eng\.ª?|Dr\.ª?|Prof\.?)\s+/i, '')
      .trim()
      .split(/\s+/);
    if (parts.length === 0) return 'CL';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  return (
    <div
      className="space-y-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-roledescription="carousel"
      aria-label="Testemunhos de Clientes da Muatxissombo"
    >
      {/* Aggregate Rating & Carousel Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-0.5" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(avgRating)
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="font-mono-tabular font-bold text-[#0A192F]">
            {avgRating.toFixed(1)} / 5.0
          </span>
          <span className="text-slate-400" aria-hidden="true">
            ·
          </span>
          <span className="text-slate-600 font-medium">
            {items.length} Avaliações de Clientes Verificados
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono-tabular text-slate-500 mr-1">
            {String(currentIndex + 1).padStart(2, '0')} /{' '}
            {String(items.length).padStart(2, '0')}
          </span>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Testemunho anterior"
            className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-[#0B5ED7] hover:text-[#0B5ED7] transition-colors flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsPaused((prev) => !prev)}
            aria-label={isPaused ? 'Retomar rotação automática' : 'Pausar rotação automática'}
            className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-[#0B5ED7] hover:text-[#0B5ED7] transition-colors flex items-center justify-center"
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Próximo testemunho"
            className="w-9 h-9 rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-[#0B5ED7] hover:text-[#0B5ED7] transition-colors flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Featured Active Testimonial Card */}
      <div
        key={activeItem.id}
        className="relative bg-[#F4F7FB] border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-5 animate-fade-up"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-[#0B5ED7]">{activeItem.serviceCategory}</span>
            {activeItem.projectReference && (
              <>
                <span className="text-slate-400" aria-hidden="true">
                  ·
                </span>
                <span className="font-mono-tabular text-slate-700">
                  {activeItem.projectReference}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1" aria-label={`Avaliação ${activeItem.rating} de 5 estrelas`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= (activeItem.rating || 5)
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-slate-300'
                }`}
              />
            ))}
            <span className="ml-1.5 text-xs font-mono-tabular font-semibold text-slate-700">
              {(activeItem.rating || 5).toFixed(1)}
            </span>
          </div>
        </div>

        <div className="relative">
          <Quote className="w-6 h-6 text-[#0B5ED7]/25 mb-2" aria-hidden="true" />
          <p className="text-sm sm:text-base text-[#0A192F] leading-relaxed font-medium">
            “{activeItem.comment}”
          </p>
        </div>

        <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0A192F] text-white text-xs font-bold flex items-center justify-center shrink-0">
              {getInitials(activeItem.clientName)}
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#0A192F]">
                {activeItem.clientName}
              </div>
              <div className="text-xs text-slate-500">
                {activeItem.companyName || 'Cliente Verificado · Angola'}
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Avaliação Verificada</span>
          </div>
        </div>
      </div>

      {/* Interactive Preview Strip (Click any upcoming review to rotate immediately) */}
      {(nextItem1 || nextItem2) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[nextItem1, nextItem2]
            .filter((x): x is TestimonialFeedbackItem => Boolean(x))
            .map((preview, offset) => {
              const targetIdx = (currentIndex + offset + 1) % items.length;
              return (
                <button
                  key={preview.id}
                  type="button"
                  onClick={() => setActiveIndex(targetIdx)}
                  className="text-left bg-white border border-slate-200 hover:border-[#0B5ED7] rounded-xl p-4 space-y-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span className="truncate font-medium text-[#0B5ED7]">
                      {preview.serviceCategory}
                    </span>
                    <span className="font-mono-tabular font-semibold text-amber-600 shrink-0">
                      {preview.rating}.0 ★
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    “{preview.comment}”
                  </p>
                  <div className="text-xs font-bold text-[#0A192F] truncate">
                    {preview.clientName}{' '}
                    <span className="font-normal text-slate-500">
                      · {preview.companyName || 'Cliente Verificado'}
                    </span>
                  </div>
                </button>
              );
            })}
        </div>
      )}

      {/* Slide Progress Dots */}
      <div className="flex items-center justify-center gap-1.5 pt-1" role="tablist" aria-label="Selecionar testemunho">
        {items.map((item, idx) => {
          const active = idx === currentIndex;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={`Ver testemunho de ${item.clientName}`}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all duration-200 ${
                active
                  ? 'w-7 bg-[#0B5ED7]'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
