import React, { useState, useEffect } from 'react';
import { ArrowRight, History, ArrowLeftRight, Trash2, Calculator } from 'lucide-react';

// 画像に基づいた固定変換レート定義
// JPY: 日本円, GBP: ポンド, EUR: ユーロ
const RATES = {
  "JPY-GBP": 0.00487,
  "JPY-EUR": 0.00553,
  "GBP-JPY": 205.199,
  "EUR-JPY": 180.699,
  "GBP-EUR": 1.13557,
  "EUR-GBP": 0.8804
};

const CURRENCIES = [
  { code: 'JPY', name: '日本円', symbol: '¥', flag: '🇯🇵' },
  { code: 'EUR', name: 'ユーロ', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'ポンド', symbol: '£', flag: '🇬🇧' },
];

export default function App() {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('JPY');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState(null);
  const [rateUsed, setRateUsed] = useState(null);
  const [history, setHistory] = useState([]);

  // 計算実行関数
  const handleConvert = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    let rate = 1;
    let calculatedResult = 0;

    if (fromCurrency === toCurrency) {
      rate = 1;
      calculatedResult = numAmount;
    } else {
      const key = `${fromCurrency}-${toCurrency}`;
      rate = RATES[key];
      
      // レートが見つからない場合のフォールバック（通常ここには来ないはず）
      if (rate === undefined) {
        console.error("Rate not found");
        return;
      }
      calculatedResult = numAmount * rate;
    }

    // 結果のフォーマット（小数点以下の扱い）
    // JPYが宛先の場合は整数に近い方が自然だが、正確性のために小数点2桁まで表示
    // 他通貨は小数点4桁くらいまで表示すると精度良く見える
    const formattedResult = toCurrency === 'JPY' 
      ? Math.round(calculatedResult * 100) / 100 
      : Math.round(calculatedResult * 10000) / 10000;

    setResult(formattedResult);
    setRateUsed(rate);

    // 履歴に追加 (新しいものを先頭に、最大10件)
    const newHistoryItem = {
      id: Date.now(),
      date: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      amountSource: numAmount,
      amountTarget: formattedResult,
      from: fromCurrency,
      to: toCurrency,
      rate: rate
    };

    setHistory(prev => [newHistoryItem, ...prev].slice(0, 10));
  };

  // 通貨入れ替え
  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null); // 入れ替えたら一旦結果をリセット
    setRateUsed(null);
  };

  // 履歴クリア
  const clearHistory = () => {
    setHistory([]);
  };

  // Enterキーで計算
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleConvert();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="max-w-md w-full space-y-6">
        
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-700 flex items-center justify-center gap-2">
            <Calculator className="w-8 h-8 text-blue-600" />
            為替コンバータ
          </h1>
          <p className="text-slate-500 mt-2 text-sm">日本円・ユーロ・ポンド専用</p>
        </div>

        {/* メインカード */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="p-6 space-y-6">
            
            {/* 金額入力 */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">金額</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="0"
                className="w-full text-3xl font-bold p-3 border-b-2 border-slate-200 focus:border-blue-500 outline-none bg-transparent transition-colors placeholder-slate-300"
                autoFocus
              />
            </div>

            {/* 通貨選択エリア */}
            <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
              {/* From */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">変換元</label>
                <select
                  value={fromCurrency}
                  onChange={(e) => {
                    setFromCurrency(e.target.value);
                    setResult(null);
                  }}
                  className="w-full p-3 bg-slate-50 rounded-xl font-medium appearance-none border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.code})</option>
                  ))}
                </select>
              </div>

              {/* Swap Button */}
              <div className="pt-5">
                <button 
                  onClick={swapCurrencies}
                  className="p-2 rounded-full bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 transition-all transform hover:rotate-180 active:scale-90"
                  title="通貨を入れ替え"
                >
                  <ArrowLeftRight size={20} />
                </button>
              </div>

              {/* To */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">変換先</label>
                <select
                  value={toCurrency}
                  onChange={(e) => {
                    setToCurrency(e.target.value);
                    setResult(null);
                  }}
                  className="w-full p-3 bg-slate-50 rounded-xl font-medium appearance-none border border-slate-200 focus:ring-2 focus:ring-blue-200 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 結果表示エリア */}
            <div className="bg-blue-50 rounded-xl p-4 min-h-[100px] flex flex-col justify-center items-center text-center relative overflow-hidden">
              {result !== null ? (
                <div className="animate-in fade-in zoom-in duration-300">
                  <div className="text-sm text-blue-400 font-medium mb-1">
                    1 {fromCurrency} = {rateUsed} {toCurrency}
                  </div>
                  <div className="text-4xl font-bold text-blue-900 tracking-tight">
                    <span className="text-2xl mr-1 text-blue-400 font-normal">
                      {CURRENCIES.find(c => c.code === toCurrency).symbol}
                    </span>
                    {result.toLocaleString()}
                  </div>
                </div>
              ) : (
                <span className="text-blue-300 font-medium text-sm">金額を入力して変換ボタンを押してください</span>
              )}
            </div>

            {/* アクションボタン */}
            <button
              onClick={handleConvert}
              disabled={!amount || amount <= 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all active:scale-[0.98] disabled:shadow-none flex items-center justify-center gap-2"
            >
              変換する
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* 履歴エリア */}
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-bold text-slate-600 flex items-center gap-2 text-sm">
              <History size={16} />
              最近の履歴 (直近10件)
            </h2>
            {history.length > 0 && (
              <button 
                onClick={clearHistory}
                className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 transition-colors"
              >
                <Trash2 size={12} />
                クリア
              </button>
            )}
          </div>
          
          <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
            {history.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                まだ履歴はありません
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="p-3 hover:bg-blue-50/50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded">
                      {item.date}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <span>{item.amountSource.toLocaleString()} {item.from}</span>
                      <ArrowRight size={14} className="text-slate-300" />
                      <span className="text-blue-600">{item.amountTarget.toLocaleString()} {item.to}</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    @{item.rate}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
