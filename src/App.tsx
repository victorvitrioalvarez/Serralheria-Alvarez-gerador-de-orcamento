/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Printer, 
  Settings, 
  FileText, 
  Building2, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock,
  Image as ImageIcon,
  CheckCircle2,
  Users,
  Save,
  Search,
  UserPlus,
  X,
  Package,
  Wrench,
  PlusCircle,
  History,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

// Types
interface BudgetRow {
  id: string;
  description: string;
  materialValue: number;
  percentage: number;
  unitValue: number;
  quantity: number;
  totalValue: number;
}

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  company: string;
}

interface SavedCustomer extends CustomerInfo {
  id: string;
}

interface SavedProduct {
  id: string;
  description: string;
  materialValue: number;
  percentage: number;
}

interface SavedBudget {
  id: string;
  budgetNumber: number;
  customer: CustomerInfo;
  rows: BudgetRow[];
  observations: string;
  validity: string;
  date: string;
  total: number;
}

interface BudgetTemplateProps {
  company: any;
  logoUrl: string;
  customer: CustomerInfo;
  budgetNumber: number;
  validity: string;
  currentDate: string;
  rows: BudgetRow[];
  observations: string;
  isCompanyCopy?: boolean;
  isInteractive?: boolean;
  onUpdateRow?: (id: string, field: keyof BudgetRow, value: string | number) => void;
  onSaveProduct?: (row: BudgetRow) => void;
  onUpdateCustomer?: (field: keyof CustomerInfo, value: string) => void;
  onUpdateValidity?: (value: string) => void;
  onUpdateObservations?: (value: string) => void;
  onLogoUpload?: (e: ChangeEvent<HTMLInputElement>) => void;
  saveCurrentCustomer?: () => void;
}

const BudgetTemplate = ({
  company,
  logoUrl,
  customer,
  budgetNumber,
  validity,
  currentDate,
  rows,
  observations,
  isCompanyCopy = false,
  isInteractive = false,
  onUpdateRow,
  onSaveProduct,
  onUpdateCustomer,
  onUpdateValidity,
  onUpdateObservations,
  onLogoUpload,
  saveCurrentCustomer
}: BudgetTemplateProps) => {
  const grandTotal = rows.reduce((sum, row) => sum + row.totalValue, 0);

  return (
    <div className={`bg-white p-8 border border-neutral-200 shadow-xl rounded-sm min-h-[297mm] flex flex-col relative ${isCompanyCopy ? 'company-copy' : 'client-copy'}`}>
      {/* Copy Label */}
      <div className="absolute top-4 right-8 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 pointer-events-none">
        {isCompanyCopy ? 'Via Empresa' : 'Via Cliente'}
      </div>

      {/* Header Section - Compact & Aligned */}
      <div className="flex justify-between items-start mb-6 border-b border-neutral-200 pb-6">
        {/* Left: Metadata */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 font-mono">
            <span className="font-bold text-neutral-900 text-xs uppercase tracking-tighter">Orçamento:</span>
            <span className="text-neutral-900 font-bold text-base">
              #{budgetNumber.toString().padStart(4, '0')}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-neutral-600 text-xs">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>Emissão: {currentDate}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600 text-xs">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <div className="flex items-center gap-1">
                <span>Validade:</span>
                {isInteractive ? (
                  <input 
                    type="text"
                    value={validity}
                    onChange={(e) => onUpdateValidity?.(e.target.value)}
                    className="border-b border-neutral-300 focus:border-blue-500 outline-none w-20 bg-transparent font-semibold text-neutral-900"
                  />
                ) : (
                  <span className="font-semibold text-neutral-900">{validity}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Logo + Company Info Aligned */}
        <div className="flex items-center gap-[62px]">
          {/* Harmonic Logo Size - Increased by 10% (96px -> 106px) */}
          <div className="w-[106px] h-[106px] flex items-center justify-center relative group">
            <img 
              src={logoUrl} 
              alt="Logo Serralheria Alvarez" 
              className="max-w-full max-h-full object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://img.freepik.com/vetores-premium/logotipo-da-serralheria-ilustracao-do-soldador_10250-3277.jpg';
              }}
            />
            {isInteractive && (
              <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg hide-on-export">
                <ImageIcon className="w-6 h-6 text-white mb-1" />
                <span className="text-white text-[8px] font-bold uppercase tracking-widest">Alterar</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={onLogoUpload} 
                  className="hidden" 
                />
              </label>
            )}
          </div>

          <div className="text-right">
            <h2 className="text-xl font-black uppercase tracking-wider text-neutral-900">
              {company.name}
            </h2>
            <div className="mt-1 space-y-0.5">
              <div className="flex items-center justify-end gap-1.5 text-neutral-500 text-[10px] font-semibold">
                <span>{company.address}</span>
                <MapPin className="w-3 h-3 text-blue-500" />
              </div>
              <div className="flex items-center justify-end gap-1.5 text-neutral-500 text-[10px] font-semibold">
                <span>{company.phone}</span>
                <Phone className="w-3 h-3 text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px bg-neutral-200 w-full mb-4" />

      {/* Customer Data Section */}
      <div className="mb-4 bg-neutral-50/50 p-4 rounded-lg border border-neutral-100">
        <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-3 h-3 text-blue-500" />
          Dados do Cliente
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          <div className="flex items-center gap-2 text-sm group/row">
            <span className="font-semibold text-neutral-700 w-24">Cliente:</span>
            <div className="flex-1 flex items-center gap-2">
              {isInteractive ? (
                <>
                  <input 
                    type="text"
                    value={customer.name}
                    onChange={(e) => onUpdateCustomer?.('name', e.target.value)}
                    placeholder={customer.name ? "" : "Nome do Cliente"}
                    className="flex-1 bg-transparent border-b border-neutral-200 focus:border-blue-500 outline-none py-0.5"
                  />
                  <button
                    onClick={saveCurrentCustomer}
                    title="Salvar Cliente"
                    className="hide-on-export p-1 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all opacity-0 group-hover/row:opacity-100"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <span className="flex-1 border-b border-transparent py-0.5">{customer.name}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-neutral-700 w-24">Telefone:</span>
            {isInteractive ? (
              <input 
                type="text"
                value={customer.phone}
                onChange={(e) => onUpdateCustomer?.('phone', e.target.value)}
                placeholder={customer.phone ? "" : "(00) 00000-0000"}
                className="flex-1 bg-transparent border-b border-neutral-200 focus:border-blue-500 outline-none py-0.5"
              />
            ) : (
              <span className="flex-1 border-b border-transparent py-0.5">{customer.phone}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-neutral-700 w-24">Endereço:</span>
            {isInteractive ? (
              <input 
                type="text"
                value={customer.address}
                onChange={(e) => onUpdateCustomer?.('address', e.target.value)}
                placeholder={customer.address ? "" : "Endereço Completo"}
                className="flex-1 bg-transparent border-b border-neutral-200 focus:border-blue-500 outline-none py-0.5"
              />
            ) : (
              <span className="flex-1 border-b border-transparent py-0.5">{customer.address}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-neutral-700 w-24">Empresa:</span>
            {isInteractive ? (
              <input 
                type="text"
                value={customer.company}
                onChange={(e) => onUpdateCustomer?.('company', e.target.value)}
                placeholder={customer.company ? "" : "Nome da Empresa (Opcional)"}
                className="flex-1 bg-transparent border-b border-neutral-200 focus:border-blue-500 outline-none py-0.5"
              />
            ) : (
              <span className="flex-1 border-b border-transparent py-0.5">{customer.company}</span>
            )}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="mb-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-neutral-900 text-white text-[9px] uppercase tracking-widest font-bold">
              <th className="p-2 text-left border border-neutral-900">Descrição do Produto/Serviço</th>
              {(isInteractive || isCompanyCopy) && (
                <>
                  <th className={`p-2 text-center border border-neutral-900 w-20 ${!isCompanyCopy ? 'hide-on-export' : ''}`}>V. Material</th>
                  <th className={`p-2 text-center border border-neutral-900 w-16 ${!isCompanyCopy ? 'hide-on-export' : ''}`}>%</th>
                </>
              )}
              <th className="p-2 text-center border border-neutral-900 w-24">V. Unitário</th>
              <th className="p-2 text-center border border-neutral-900 w-16">Qtd</th>
              <th className="p-2 text-right border border-neutral-900 w-28">V. Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="group">
                <td className="border border-neutral-200 p-0">
                  {isInteractive ? (
                    <div className="flex items-center group/cell">
                      <input 
                        type="text"
                        value={row.description}
                        onChange={(e) => onUpdateRow?.(row.id, 'description', e.target.value)}
                        className="flex-1 p-1.5 text-xs outline-none focus:bg-blue-50/50"
                        placeholder=""
                      />
                      {row.description && (
                        <button
                          onClick={() => onSaveProduct?.(row)}
                          title="Salvar como Produto/Serviço"
                          className="hide-on-export p-1 text-neutral-300 hover:text-amber-600 transition-colors opacity-0 group-hover/cell:opacity-100"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="p-1.5 text-xs min-h-[32px]">{row.description}</div>
                  )}
                </td>
                {(isInteractive || isCompanyCopy) && (
                  <>
                    <td className={`border border-neutral-200 p-0 ${!isCompanyCopy ? 'hide-on-export' : ''}`}>
                      {isInteractive ? (
                        <input 
                          type="number"
                          value={row.materialValue || ''}
                          onChange={(e) => onUpdateRow?.(row.id, 'materialValue', e.target.value)}
                          className="w-full p-1.5 text-xs text-center outline-none focus:bg-blue-50/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder={row.description ? "0.00" : ""}
                        />
                      ) : (
                        <div className="p-1.5 text-xs text-center">{row.description ? row.materialValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''}</div>
                      )}
                    </td>
                    <td className={`border border-neutral-200 p-0 ${!isCompanyCopy ? 'hide-on-export' : ''}`}>
                      {isInteractive ? (
                        <input 
                          type="number"
                          value={row.percentage || ''}
                          onChange={(e) => onUpdateRow?.(row.id, 'percentage', e.target.value)}
                          className="w-full p-1.5 text-xs text-center outline-none focus:bg-blue-50/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          placeholder={row.description ? "0" : ""}
                        />
                      ) : (
                        <div className="p-1.5 text-xs text-center">{row.description ? `${row.percentage}%` : ''}</div>
                      )}
                    </td>
                  </>
                )}
                <td className="border border-neutral-200 p-1.5 text-xs text-center bg-neutral-50 font-medium">
                  {row.description ? row.unitValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''}
                </td>
                <td className="border border-neutral-200 p-0">
                  {isInteractive ? (
                    <input 
                      type="number"
                      value={row.quantity || ''}
                      onChange={(e) => onUpdateRow?.(row.id, 'quantity', e.target.value)}
                      className="w-full p-1.5 text-xs text-center outline-none focus:bg-blue-50/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder={row.description ? "1" : ""}
                    />
                  ) : (
                    <div className="p-1.5 text-xs text-center">{row.description ? row.quantity : ''}</div>
                  )}
                </td>
                <td className="border border-neutral-200 p-1.5 text-xs text-right bg-neutral-50 font-bold">
                  {row.description ? row.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="mt-auto pt-6 border-t border-neutral-200">
        <div className="flex justify-between items-start gap-8">
          <div className="flex-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Observações</div>
            {isInteractive ? (
              <textarea 
                value={observations}
                onChange={(e) => onUpdateObservations?.(e.target.value.slice(0, 200))}
                className="w-full h-24 p-3 text-xs bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:border-blue-500 resize-none transition-colors"
                placeholder=""
                maxLength={200}
              />
            ) : (
              <div className="w-full min-h-[6rem] p-3 text-xs bg-neutral-50 border border-neutral-100 rounded-lg whitespace-pre-wrap">
                {observations}
              </div>
            )}
          </div>
          <div className="w-64 space-y-2">
            <div className="flex justify-between items-center p-3 bg-neutral-900 text-white rounded-xl shadow-lg shadow-neutral-200">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Total Geral</span>
              <span className="text-lg font-black">{grandTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="p-3 bg-white border border-neutral-200 rounded-xl text-center">
              <div className="text-[8px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1">Assinatura Responsável</div>
              <div className="h-8 border-b border-neutral-200 mb-1" />
              <div className="text-[9px] font-bold text-neutral-900 uppercase">{company.name}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-6 flex justify-between items-center text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-300">
        <span>Serralheria Alvarez • Qualidade e Confiança</span>
        <span>Gerado em {currentDate}</span>
      </div>
    </div>
  );
};

export default function App() {
  // State for budget rows (10 rows as requested)
  const [rows, setRows] = useState<BudgetRow[]>(() => 
    Array.from({ length: 10 }, (_, i) => ({
      id: crypto.randomUUID(),
      description: '',
      materialValue: 0,
      percentage: 180, // Default percentage set to 180
      unitValue: 0,
      quantity: 0,
      totalValue: 0,
    }))
  );

  // Fixed Company Info
  const company = {
    name: 'Serralheria Alvarez',
    address: 'Rua conchal, 370 - Vila Soto - Catanduva-sp',
    phone: '(17) 99605-0527',
    logo: '',
  };

  // State for Logo (Editable with Persistence)
  const [logoUrl, setLogoUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('budget_logo') || 'https://img.freepik.com/vetores-premium/logotipo-da-serralheria-ilustracao-do-soldador_10250-3277.jpg';
    }
    return 'https://img.freepik.com/vetores-premium/logotipo-da-serralheria-ilustracao-do-soldador_10250-3277.jpg';
  });

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoUrl(base64);
        localStorage.setItem('budget_logo', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // State for customer info
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    phone: '',
    address: '',
    company: '',
  });

  // State for budget metadata
  const [budgetNumber, setBudgetNumber] = useState<number>(1);
  const [validity, setValidity] = useState('15 dias');
  const [observations, setObservations] = useState('');
  const [currentDate] = useState(new Date().toLocaleDateString('pt-BR'));
  
  // Auto-save draft
  useEffect(() => {
    const draft = {
      customer,
      rows,
      observations,
      validity,
      budgetNumber
    };
    localStorage.setItem('budget_current_draft', JSON.stringify(draft));
  }, [customer, rows, observations, validity, budgetNumber]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('budget_current_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setCustomer(draft.customer);
        setRows(draft.rows);
        setObservations(draft.observations);
        setValidity(draft.validity);
        setBudgetNumber(draft.budgetNumber);
      } catch (e) {
        console.error('Error loading draft', e);
      }
    }
  }, []);

  // UI States
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [savedCustomers, setSavedCustomers] = useState<SavedCustomer[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('budget_saved_customers');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [showProductList, setShowProductList] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('budget_saved_products');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [showHistory, setShowHistory] = useState(false);
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [savedBudgets, setSavedBudgets] = useState<SavedBudget[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('budget_history');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const budgetRef = useRef<HTMLDivElement>(null);

  // Save customer to list
  const saveCurrentCustomer = () => {
    if (!customer.name.trim()) return;
    
    const newSavedCustomers = [...savedCustomers];
    const existingIndex = newSavedCustomers.findIndex(c => c.name.toLowerCase() === customer.name.toLowerCase());
    
    const customerToSave = { ...customer, id: crypto.randomUUID() };
    
    if (existingIndex >= 0) {
      newSavedCustomers[existingIndex] = { ...customerToSave, id: newSavedCustomers[existingIndex].id };
    } else {
      newSavedCustomers.push(customerToSave);
    }
    
    setSavedCustomers(newSavedCustomers);
    localStorage.setItem('budget_saved_customers', JSON.stringify(newSavedCustomers));
    
    setSuccessMessage('Cliente salvo com sucesso!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const selectSavedCustomer = (selected: SavedCustomer) => {
    setCustomer({
      name: selected.name,
      phone: selected.phone,
      address: selected.address,
      company: selected.company
    });
    setShowCustomerList(false);
    setCustomerSearchTerm('');
  };

  const deleteSavedCustomer = (id: string, e: any) => {
    e.stopPropagation();
    const filtered = savedCustomers.filter(c => c.id !== id);
    setSavedCustomers(filtered);
    localStorage.setItem('budget_saved_customers', JSON.stringify(filtered));
  };

  // Product Database Logic
  const saveProduct = (row: BudgetRow) => {
    if (!row.description.trim()) return;
    
    const newSavedProducts = [...savedProducts];
    const existingIndex = newSavedProducts.findIndex(p => p.description.toLowerCase() === row.description.toLowerCase());
    
    const productToSave = { 
      id: crypto.randomUUID(),
      description: row.description,
      materialValue: row.materialValue,
      percentage: row.percentage
    };
    
    if (existingIndex >= 0) {
      newSavedProducts[existingIndex] = { ...productToSave, id: newSavedProducts[existingIndex].id };
    } else {
      newSavedProducts.push(productToSave);
    }
    
    setSavedProducts(newSavedProducts);
    localStorage.setItem('budget_saved_products', JSON.stringify(newSavedProducts));
    
    setSuccessMessage('Produto/Serviço salvo com sucesso!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const selectSavedProduct = (selected: SavedProduct) => {
    // Find first empty row or use the first row if all are filled
    const firstEmptyIndex = rows.findIndex(r => !r.description.trim());
    const targetIndex = firstEmptyIndex >= 0 ? firstEmptyIndex : 0;
    
    setRows(prevRows => prevRows.map((row, idx) => {
      if (idx === targetIndex) {
        const updatedRow = { 
          ...row, 
          description: selected.description,
          materialValue: selected.materialValue,
          percentage: selected.percentage
        };
        // Recalculate values
        updatedRow.unitValue = updatedRow.materialValue + (updatedRow.materialValue * updatedRow.percentage / 100);
        updatedRow.totalValue = updatedRow.unitValue * updatedRow.quantity;
        return updatedRow;
      }
      return row;
    }));
    
    setShowProductList(false);
    setProductSearchTerm('');
    
    setSuccessMessage('Produto adicionado ao orçamento!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const deleteSavedProduct = (id: string, e: any) => {
    e.stopPropagation();
    const filtered = savedProducts.filter(p => p.id !== id);
    setSavedProducts(filtered);
    localStorage.setItem('budget_saved_products', JSON.stringify(filtered));
  };

  // Budget History Logic
  const saveBudgetToHistory = () => {
    if (!customer.name.trim()) {
      setSuccessMessage('Erro! Informe o nome do cliente para salvar.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      return;
    }

    const newSavedBudgets = [...savedBudgets];
    const budgetToSave: SavedBudget = {
      id: crypto.randomUUID(),
      budgetNumber,
      customer: { ...customer },
      rows: [...rows],
      observations,
      validity,
      date: currentDate,
      total: grandTotal
    };

    newSavedBudgets.unshift(budgetToSave); // Add to beginning
    setSavedBudgets(newSavedBudgets);
    localStorage.setItem('budget_history', JSON.stringify(newSavedBudgets));

    setSuccessMessage('Orçamento salvo no histórico!');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const loadBudgetFromHistory = (budget: SavedBudget) => {
    setBudgetNumber(budget.budgetNumber);
    setCustomer(budget.customer);
    setRows(budget.rows);
    setObservations(budget.observations);
    setValidity(budget.validity);
    
    setShowHistory(false);
    setHistorySearchTerm('');
    
    setSuccessMessage(`Orçamento #${budget.budgetNumber} carregado!`);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const deleteBudgetFromHistory = (id: string, e: any) => {
    e.stopPropagation();
    const filtered = savedBudgets.filter(b => b.id !== id);
    setSavedBudgets(filtered);
    localStorage.setItem('budget_history', JSON.stringify(filtered));
  };

  const clearCurrentBudget = () => {
    if (window.confirm('Deseja realmente limpar o orçamento atual?')) {
      setCustomer({ name: '', phone: '', address: '', company: '' });
      setRows(Array.from({ length: 10 }, (_, i) => ({
        id: crypto.randomUUID(),
        description: '',
        materialValue: 0,
        percentage: 180,
        unitValue: 0,
        quantity: 0,
        totalValue: 0,
      })));
      setObservations('');
      setValidity('15 dias');
    }
  };

  // Load budget number from localStorage with yearly reset logic
  useEffect(() => {
    const currentYear = new Date().getFullYear().toString();
    const lastResetYear = localStorage.getItem('budget_last_reset_year');
    const savedNumber = localStorage.getItem('budget_count');

    if (lastResetYear !== currentYear) {
      // It's a new year! Reset counter to 1
      setBudgetNumber(1);
      localStorage.setItem('budget_count', '1');
      localStorage.setItem('budget_last_reset_year', currentYear);
    } else if (savedNumber) {
      // Same year, load existing counter
      setBudgetNumber(parseInt(savedNumber, 10));
    }
  }, []);

  // Update calculations when row data changes
  const updateRow = (id: string, field: keyof BudgetRow, value: string | number) => {
    setRows(prevRows => prevRows.map(row => {
      if (row.id === id) {
        const updatedRow = { ...row, [field]: value };
        
        // Logic: Unit Value = Material Value + (Material Value * Percentage / 100)
        if (field === 'materialValue' || field === 'percentage') {
          const matVal = Number(field === 'materialValue' ? value : row.materialValue);
          const perc = Number(field === 'percentage' ? value : row.percentage);
          updatedRow.unitValue = matVal + (matVal * perc / 100);
        }

        // Logic: Total Value = Unit Value * Quantity
        const unitVal = updatedRow.unitValue;
        const qty = Number(field === 'quantity' ? value : row.quantity);
        updatedRow.totalValue = unitVal * qty;

        return updatedRow;
      }
      return row;
    }));
  };

  // Calculate grand total
  const grandTotal = rows.reduce((sum, row) => sum + row.totalValue, 0);

  // Generate PDF
  const generatePDF = async () => {
    if (!budgetRef.current) return;
    setIsGenerating(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();

      // 1. Capture Client Copy
      const clientElement = budgetRef.current.querySelector('.client-copy') as HTMLElement;
      if (clientElement) {
        clientElement.classList.add('is-exporting');
        const clientDataUrl = await toPng(clientElement, {
          quality: 1.0,
          pixelRatio: 2,
          filter: (node) => !(node instanceof HTMLElement && node.classList.contains('hide-on-export')),
        });
        clientElement.classList.remove('is-exporting');
        
        const clientImgProps = pdf.getImageProperties(clientDataUrl);
        const clientPdfHeight = (clientImgProps.height * pdfWidth) / clientImgProps.width;
        pdf.addImage(clientDataUrl, 'PNG', 0, 0, pdfWidth, clientPdfHeight);
      }

      // 2. Add Page and Capture Company Copy
      pdf.addPage();
      const companyElement = budgetRef.current.querySelector('.company-copy') as HTMLElement;
      if (companyElement) {
        companyElement.classList.add('is-exporting');
        const companyDataUrl = await toPng(companyElement, {
          quality: 1.0,
          pixelRatio: 2,
          filter: (node) => !(node instanceof HTMLElement && node.classList.contains('hide-on-export')),
        });
        companyElement.classList.remove('is-exporting');

        const companyImgProps = pdf.getImageProperties(companyDataUrl);
        const companyPdfHeight = (companyImgProps.height * pdfWidth) / companyImgProps.width;
        pdf.addImage(companyDataUrl, 'PNG', 0, 0, pdfWidth, companyPdfHeight);
      }
      
      pdf.save(`orcamento-${budgetNumber}.pdf`);

      // Increment budget number after successful generation
      const nextNumber = budgetNumber + 1;
      setBudgetNumber(nextNumber);
      localStorage.setItem('budget_count', nextNumber.toString());

      // Show success indicator
      setSuccessMessage(`PDF Gerado com Sucesso! Orçamento #${budgetNumber - 1} salvo.`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Print functionality
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8 font-sans text-neutral-900">
      <style>
        {`
          .hidden-in-ui-but-captureable {
            display: block;
            position: absolute;
            left: -9999px;
            top: -9999px;
            pointer-events: none;
          }
          @media print {
            body * {
              visibility: hidden;
            }
            .print-area, .print-area * {
              visibility: visible;
            }
            .print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              border: none !important;
              box-shadow: none !important;
            }
            .hidden-in-ui-but-captureable {
              position: static;
              left: auto;
              top: auto;
              display: block !important;
            }
            .hide-on-export {
              display: none !important;
            }
            .client-copy, .company-copy {
              page-break-after: always;
              margin-bottom: 20mm;
            }
            input::placeholder, textarea::placeholder {
              color: transparent !important;
            }
            input, textarea {
              border-color: transparent !important;
              background: transparent !important;
            }
          }
          /* Styles for PDF generation */
          .is-exporting input::placeholder, 
          .is-exporting textarea::placeholder {
            color: transparent !important;
          }
          .is-exporting input, 
          .is-exporting textarea {
            border-color: transparent !important;
            background: transparent !important;
          }
        `}
      </style>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Success Message */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-emerald-200 flex items-center gap-3 border border-emerald-500"
            >
              <div className="bg-white/20 p-1 rounded-full">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm">{successMessage.split('!')[0]}!</p>
                <p className="text-[10px] opacity-90 uppercase tracking-widest">{successMessage.split('!')[1]}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header / Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-2">
              <div className="relative">
                <button
                  onClick={() => {
                    setShowCustomerList(!showCustomerList);
                    setShowProductList(false);
                    setShowHistory(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors font-medium text-sm w-full"
                >
                  <Users className="w-4 h-4" />
                  Clientes Salvos
                </button>

                <AnimatePresence>
                  {showCustomerList && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-neutral-200 z-50 max-h-96 overflow-y-auto"
                    >
                      <div className="p-3 border-b border-neutral-100 flex justify-between items-center bg-neutral-50 sticky top-0 z-10">
                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Selecione um Cliente</span>
                        <button 
                          onClick={() => {
                            setShowCustomerList(false);
                            setCustomerSearchTerm('');
                          }} 
                          className="text-neutral-400 hover:text-neutral-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="p-2 border-b border-neutral-100 bg-white sticky top-[41px] z-10">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                          <input 
                            type="text"
                            placeholder="Buscar cliente..."
                            value={customerSearchTerm}
                            onChange={(e) => setCustomerSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
                          />
                        </div>
                      </div>

                      {savedCustomers.length === 0 ? (
                        <div className="p-8 text-center text-neutral-400 text-sm">
                          Nenhum cliente salvo ainda.
                        </div>
                      ) : (
                        <div className="divide-y divide-neutral-100">
                          {(() => {
                            const filtered = savedCustomers.filter(c => 
                              c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
                              c.phone.includes(customerSearchTerm)
                            );
                            
                            if (filtered.length === 0 && customerSearchTerm) {
                              return (
                                <div className="p-8 text-center text-neutral-400 text-xs italic">
                                  Nenhum cliente encontrado para "{customerSearchTerm}"
                                </div>
                              );
                            }
                            
                            return filtered.map(c => (
                              <div
                                key={c.id}
                                onClick={() => selectSavedCustomer(c)}
                                className="p-3 hover:bg-blue-50 cursor-pointer transition-colors group flex justify-between items-center"
                              >
                                <div className="flex flex-col">
                                  <span className="font-bold text-neutral-800 text-sm">{c.name}</span>
                                  <span className="text-[10px] text-neutral-500">{c.phone || 'Sem telefone'}</span>
                                </div>
                                <button 
                                  onClick={(e) => deleteSavedCustomer(c.id, e)}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 text-red-500 rounded-md transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setShowProductList(!showProductList);
                    setShowCustomerList(false);
                    setShowHistory(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors font-medium text-sm w-full"
                >
                  <Package className="w-4 h-4" />
                  Produtos/Serviços
                </button>

                <AnimatePresence>
                  {showProductList && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-neutral-200 z-50 max-h-96 overflow-y-auto"
                    >
                      <div className="p-3 border-b border-neutral-100 flex justify-between items-center bg-neutral-50 sticky top-0 z-10">
                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Produtos Salvos</span>
                        <button 
                          onClick={() => {
                            setShowProductList(false);
                            setProductSearchTerm('');
                          }} 
                          className="text-neutral-400 hover:text-neutral-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="p-2 border-b border-neutral-100 bg-white sticky top-[41px] z-10">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                          <input 
                            type="text"
                            placeholder="Buscar produto ou serviço..."
                            value={productSearchTerm}
                            onChange={(e) => setProductSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
                          />
                        </div>
                      </div>

                      {savedProducts.length === 0 ? (
                        <div className="p-8 text-center text-neutral-400 text-sm">
                          Nenhum produto salvo ainda.
                        </div>
                      ) : (
                        <div className="divide-y divide-neutral-100">
                          {(() => {
                            const filtered = savedProducts.filter(p => 
                              p.description.toLowerCase().includes(productSearchTerm.toLowerCase())
                            );
                            
                            if (filtered.length === 0 && productSearchTerm) {
                              return (
                                <div className="p-8 text-center text-neutral-400 text-xs italic">
                                  Nenhum produto encontrado para "{productSearchTerm}"
                                </div>
                              );
                            }
                            
                            return filtered.map(p => (
                              <div
                                key={p.id}
                                onClick={() => selectSavedProduct(p)}
                                className="p-3 hover:bg-blue-50 cursor-pointer transition-colors group flex justify-between items-center"
                              >
                                <div className="flex flex-col">
                                  <span className="font-bold text-neutral-800 text-xs">{p.description}</span>
                                  <div className="flex gap-2 mt-0.5">
                                    <span className="text-[9px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">Mat: {p.materialValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                    <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Lucro: {p.percentage}%</span>
                                  </div>
                                </div>
                                <button 
                                  onClick={(e) => deleteSavedProduct(p.id, e)}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 text-red-500 rounded-md transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <button
                  onClick={() => {
                    setShowHistory(!showHistory);
                    setShowCustomerList(false);
                    setShowProductList(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors font-medium text-sm w-full"
                >
                  <History className="w-4 h-4" />
                  Histórico
                </button>

                <AnimatePresence>
                  {showHistory && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-neutral-200 z-50 max-h-96 overflow-y-auto"
                    >
                      <div className="p-3 border-b border-neutral-100 flex justify-between items-center bg-neutral-50 sticky top-0 z-10">
                        <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Histórico de Orçamentos</span>
                        <button 
                          onClick={() => {
                            setShowHistory(false);
                            setHistorySearchTerm('');
                          }} 
                          className="text-neutral-400 hover:text-neutral-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="p-2 border-b border-neutral-100 bg-white sticky top-[41px] z-10">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                          <input 
                            type="text"
                            placeholder="Buscar por cliente ou número..."
                            value={historySearchTerm}
                            onChange={(e) => setHistorySearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
                          />
                        </div>
                      </div>

                      {savedBudgets.length === 0 ? (
                        <div className="p-8 text-center text-neutral-400 text-sm">
                          Nenhum orçamento salvo no histórico.
                        </div>
                      ) : (
                        <div className="divide-y divide-neutral-100">
                          {(() => {
                            const filtered = savedBudgets.filter(b => 
                              b.customer.name.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
                              b.budgetNumber.toString().includes(historySearchTerm)
                            );
                            
                            if (filtered.length === 0 && historySearchTerm) {
                              return (
                                <div className="p-8 text-center text-neutral-400 text-xs italic">
                                  Nenhum orçamento encontrado para "{historySearchTerm}"
                                </div>
                              );
                            }
                            
                            return filtered.map(b => (
                              <div
                                key={b.id}
                                onClick={() => loadBudgetFromHistory(b)}
                                className="p-3 hover:bg-blue-50 cursor-pointer transition-colors group flex justify-between items-center"
                              >
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-neutral-800 text-xs">#{b.budgetNumber.toString().padStart(4, '0')}</span>
                                    <span className="text-[10px] text-neutral-500">{b.date}</span>
                                  </div>
                                  <span className="text-xs text-neutral-700 font-medium truncate max-w-[180px]">{b.customer.name}</span>
                                  <span className="text-[10px] font-bold text-blue-600">{b.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                </div>
                                <button 
                                  onClick={(e) => deleteBudgetFromHistory(b.id, e)}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 text-red-500 rounded-md transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Gerador de Orçamentos
              </h1>
              <p className="text-neutral-500 text-sm">Serralheria Alvarez - Gestão de Propostas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearCurrentBudget}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors font-medium text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Novo
            </button>
            <button
              onClick={saveBudgetToHistory}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors font-medium text-sm"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors font-medium text-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium text-sm shadow-md shadow-blue-100 disabled:opacity-50"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Gerar PDF
            </button>
          </div>
        </div>

        {/* Budget Preview Area */}
        <div ref={budgetRef} className="print-area space-y-8">
          {/* Interactive Client Copy (The one user sees and edits) */}
          <BudgetTemplate 
            company={company}
            logoUrl={logoUrl}
            customer={customer}
            budgetNumber={budgetNumber}
            validity={validity}
            currentDate={currentDate}
            rows={rows}
            observations={observations}
            isInteractive={true}
            onUpdateRow={updateRow}
            onSaveProduct={saveProduct}
            onUpdateCustomer={(field, value) => setCustomer(prev => ({ ...prev, [field]: value }))}
            onUpdateValidity={setValidity}
            onUpdateObservations={setObservations}
            onLogoUpload={handleLogoUpload}
            saveCurrentCustomer={saveCurrentCustomer}
          />

          {/* Static Company Copy (Hidden in UI, visible in Print/PDF) */}
          {/* We use a wrapper that is hidden from view but present for html-to-image */}
          <div className="print:block hidden-in-ui-but-captureable">
            <BudgetTemplate 
              company={company}
              logoUrl={logoUrl}
              customer={customer}
              budgetNumber={budgetNumber}
              validity={validity}
              currentDate={currentDate}
              rows={rows}
              observations={observations}
              isCompanyCopy={true}
            />
          </div>
        </div>

        {/* Tips Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-12 hide-on-export">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <Settings className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-900">Cálculo Automático</h4>
              <p className="text-xs text-blue-700 mt-1">O valor unitário é calculado somando a porcentagem ao valor do material.</p>
            </div>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex gap-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-900">Banco de Produtos</h4>
              <p className="text-xs text-emerald-700 mt-1">Salve produtos e serviços frequentes (com valor e %) para agilizar novos orçamentos.</p>
            </div>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
              <History className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">Histórico de Orçamentos</h4>
              <p className="text-xs text-amber-700 mt-1">Clique em "Salvar" para guardar o orçamento atual e reabri-lo quando quiser no botão "Histórico".</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
