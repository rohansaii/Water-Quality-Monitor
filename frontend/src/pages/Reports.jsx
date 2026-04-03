// import { useNavigate } from "react-router-dom";

// const Reports = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen flex bg-sky-50 font-sans">
//       {/* Sidebar - Consistent with Dashboard */}
//       <div className="w-64 bg-sky-600 text-white flex flex-col p-6">
//         <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
//           <span className="text-3xl">💧</span> WQM
//         </h2>
//         <ul className="space-y-4 flex-1">
//           <li onClick={() => navigate("/dashboard")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors">
//             🏠 Dashboard Overview
//           </li>
//           <li onClick={() => navigate("/map")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer transition-colors">
//             📍 Live Map View
//           </li>
//           <li className="bg-white text-sky-600 p-3 rounded-lg font-bold shadow-md">
//             📊 Analytics & Reports
//           </li>
//         </ul>
//       </div>

//       {/* Content Area */}
//       <div className="flex-1 p-8">
//         <header className="mb-8">
//           <h1 className="text-3xl font-bold text-sky-900">Analytics & Reports</h1>
//           <p className="text-sky-600">Download and analyze historical water quality data.</p>
//         </header>

//         <div className="bg-white rounded-3xl p-8 shadow-sm border border-sky-100">
//           <h2 className="text-xl font-bold text-sky-900 mb-4">Export Options</h2>
//           <div className="flex gap-4">
//             <button className="bg-sky-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-sky-700 transition-all">
//               Download CSV Report
//             </button>
//             <button className="bg-sky-100 text-sky-700 px-6 py-2 rounded-lg font-bold hover:bg-sky-200 transition-all">
//               Generate PDF Summary
//             </button>
//           </div>
          
//           <div className="mt-8 p-12 border-2 border-dashed border-sky-100 rounded-2xl bg-sky-50/30 flex items-center justify-center">
//              <p className="text-sky-400 font-medium italic italic">Historical Data Tables Coming Soon...</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Reports;

// import { useNavigate } from "react-router-dom";

// const Reports = () => {
//   const navigate = useNavigate();

//   // Historical mock data
//   const logs = [
//     { id: 1, date: "2026-02-18", time: "11:30 AM", ph: 7.2, turbidity: "1.5 NTU", status: "Stable" },
//     { id: 2, date: "2026-02-18", time: "10:15 AM", ph: 8.4, turbidity: "2.1 NTU", status: "Alert" },
//     { id: 3, date: "2026-02-17", time: "09:00 PM", ph: 7.0, turbidity: "1.2 NTU", status: "Stable" },
//   ];

//   return (
//     <div className="min-h-screen flex bg-sky-50 font-sans">
//       {/* Consistent Sidebar */}
//       <div className="w-64 bg-sky-600 text-white flex flex-col p-6">
//         <h2 className="text-2xl font-bold mb-8 italic">💧 WQM</h2>
//         <ul className="space-y-2">
//           <li onClick={() => navigate("/dashboard")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">🏠 Dashboard</li>
//           <li onClick={() => navigate("/map")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">📍 Live Map</li>
//           <li className="bg-white text-sky-600 p-3 rounded-lg font-bold shadow-md">📊 Reports</li>
//         </ul>
//       </div>

//       <div className="flex-1 p-8">
//         <header className="mb-8 flex justify-between items-end">
//           <div>
//             <h1 className="text-3xl font-bold text-sky-900 tracking-tight">Analytics & Reports</h1>
//             <p className="text-sky-600 font-medium">Export historical data for auditing.</p>
//           </div>
//           <div className="flex gap-4">
//             <button className="bg-sky-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:shadow-sky-200">Download CSV</button>
//             <button className="bg-white text-sky-600 border border-sky-200 px-6 py-2 rounded-xl font-bold hover:bg-sky-100">Print PDF</button>
//           </div>
//         </header>

//         {/* Data Table */}
//         <div className="bg-white rounded-3xl shadow-sm border border-sky-100 overflow-hidden">
//           <table className="w-full text-left">
//             <thead className="bg-sky-50 text-sky-700 uppercase text-xs font-black tracking-tighter">
//               <tr>
//                 <th className="p-5">Timestamp</th>
//                 <th className="p-5">pH Level</th>
//                 <th className="p-5">Turbidity</th>
//                 <th className="p-5">Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-sky-50">
//               {logs.map((log) => (
//                 <tr key={log.id} className="hover:bg-sky-50/40 transition-colors">
//                   <td className="p-5 text-slate-500 font-medium">{log.date} | {log.time}</td>
//                   <td className="p-5 font-bold text-sky-700">{log.ph}</td>
//                   <td className="p-5 text-slate-600">{log.turbidity}</td>
//                   <td className="p-5">
//                     <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${log.status === 'Alert' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
//                       {log.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Reports;
// import { useNavigate } from "react-router-dom";
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

// const Reports = () => {
//   const navigate = useNavigate();

//   const logs = [
//     { id: 1, date: "2026-02-18", time: "11:30 AM", ph: 7.2, turbidity: "1.5 NTU", status: "Stable" },
//     { id: 2, date: "2026-02-18", time: "10:15 AM", ph: 8.4, turbidity: "2.1 NTU", status: "Alert" },
//     { id: 3, date: "2026-02-17", time: "09:00 PM", ph: 7.0, turbidity: "1.2 NTU", status: "Stable" },
//   ];

//   const downloadCSV = () => {
//     const headers = "Date,Time,pH Level,Turbidity,Status\n";
//     const rows = logs.map(l => `${l.date},${l.time},${l.ph},${l.turbidity},${l.status}`).join("\n");
//     const blob = new Blob([headers + rows], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.setAttribute('hidden', '');
//     a.setAttribute('href', url);
//     a.setAttribute('download', 'WQM_Report.csv');
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//   };

//   const downloadPDF = () => {
//     const doc = new jsPDF();
//     doc.setFontSize(18);
//     doc.setTextColor(3, 105, 161);
//     doc.text("Water Quality Management - Historical Report", 14, 22);
    
//     doc.setFontSize(11);
//     doc.setTextColor(100);
//     doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

//     const tableColumn = ["Date", "Time", "pH Level", "Turbidity", "Status"];
//     const tableRows = logs.map(log => [log.date, log.time, log.ph, log.turbidity, log.status]);

//     doc.autoTable({
//       head: [tableColumn],
//       body: tableRows,
//       startY: 40,
//       theme: 'grid',
//       headStyles: { fillStyle: [3, 105, 161] },
//     });

//     doc.save('WQM_Report.pdf');
//   };

//   return (
//     <div className="min-h-screen flex bg-sky-50 font-sans">
//       <div className="w-64 bg-sky-600 text-white flex flex-col p-6 shadow-xl">
//         <h2 className="text-2xl font-bold mb-8 italic">💧 WQM</h2>
//         <ul className="space-y-2 flex-1">
//           <li onClick={() => navigate("/dashboard")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">🏠 Dashboard Overview</li>
//           <li onClick={() => navigate("/map")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">📍 Live Map View</li>
//           <li className="bg-white text-sky-600 p-3 rounded-lg font-bold shadow-md">📊 Analytics & Reports</li>
//         </ul>
//       </div>

//       <div className="flex-1 p-8">
//         <header className="mb-8 flex justify-between items-end">
//           <div>
//             <h1 className="text-3xl font-bold text-sky-900 tracking-tight">Analytics & Reports</h1>
//             <p className="text-sky-600 font-medium italic">Generate and download sensor data history.</p>
//           </div>
//           <div className="flex gap-4">
//             <button onClick={downloadCSV} className="bg-sky-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-sky-700 transition-all">Download CSV</button>
//             <button onClick={downloadPDF} className="bg-white text-sky-600 border border-sky-200 px-6 py-2 rounded-xl font-bold hover:bg-sky-50 transition-all">Print PDF</button>
//           </div>
//         </header>

//         <div className="bg-white rounded-3xl shadow-sm border border-sky-100 overflow-hidden">
//           <table className="w-full text-left">
//             <thead className="bg-sky-50 text-sky-700 uppercase text-xs font-black tracking-widest">
//               <tr>
//                 <th className="p-5">Timestamp</th>
//                 <th className="p-5">pH Level</th>
//                 <th className="p-5">Turbidity</th>
//                 <th className="p-5">Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-sky-50">
//               {logs.map((log) => (
//                 <tr key={log.id} className="hover:bg-sky-50/40 transition-colors">
//                   <td className="p-5 text-slate-500 font-medium">{log.date} | {log.time}</td>
//                   <td className="p-5 font-bold text-sky-700">{log.ph}</td>
//                   <td className="p-5 text-slate-600">{log.turbidity}</td>
//                   <td className="p-5">
//                     <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${log.status === 'Alert' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
//                       {log.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Reports;

import { useNavigate } from "react-router-dom";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // 1. Change this import

const Reports = () => {
  const navigate = useNavigate();

  const logs = [
    { id: 1, date: "2026-02-18", time: "11:30 AM", ph: 7.2, turbidity: "1.5 NTU", status: "Stable" },
    { id: 2, date: "2026-02-18", time: "10:15 AM", ph: 8.4, turbidity: "2.1 NTU", status: "Alert" },
    { id: 3, date: "2026-02-17", time: "09:00 PM", ph: 7.0, turbidity: "1.2 NTU", status: "Stable" },
  ];

  // CSV logic (already working for you)
  const downloadCSV = () => {
    const headers = "Date,Time,pH Level,Turbidity,Status\n";
    const rows = logs.map(l => `${l.date},${l.time},${l.ph},${l.turbidity},${l.status}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'WQM_Report.csv';
    a.click();
  };

  // UPDATED PDF logic
  const downloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setTextColor(3, 105, 161);
    doc.text("Water Quality Management - Historical Report", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    const tableColumn = ["Date", "Time", "pH Level", "Turbidity", "Status"];
    const tableRows = logs.map(log => [log.date, log.time, log.ph, log.turbidity, log.status]);

    // 2. Use autoTable(doc, {...}) instead of doc.autoTable
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillGray: 200, textColor: [255, 255, 255], fillColor: [3, 105, 161] },
      styles: { fontSize: 9 }
    });

    doc.save('WQM_Report.pdf');
  };

  return (
    <div className="min-h-screen flex bg-sky-50 font-sans">
      <div className="w-64 bg-sky-600 text-white flex flex-col p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-8 italic">💧 WQM</h2>
        {/* <ul className="space-y-2 flex-1">
          <li onClick={() => navigate("/dashboard")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">🏠 Dashboard Overview</li>
          <li onClick={() => navigate("/map")} className="hover:bg-sky-500 p-3 rounded-lg cursor-pointer">📍 Live Map View</li>
          <li className="bg-white text-sky-600 p-3 rounded-lg font-bold shadow-md">📊 Analytics & Reports</li>
        </ul> */}
        
      </div>

      <div className="flex-1 p-8">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-sky-900 tracking-tight">Analytics & Reports</h1>
            <p className="text-sky-600 font-medium italic">Generate and download sensor data history.</p>
          </div>
          <div className="flex gap-4">
            <button onClick={downloadCSV} className="bg-sky-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-sky-700 transition-all">Download CSV</button>
            <button onClick={downloadPDF} className="bg-white text-sky-600 border border-sky-200 px-6 py-2 rounded-xl font-bold hover:bg-sky-50 transition-all">Print PDF</button>
          </div>
        </header>

        <div className="bg-white rounded-3xl shadow-sm border border-sky-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-sky-50 text-sky-700 uppercase text-xs font-black tracking-widest">
              <tr>
                <th className="p-5">Timestamp</th>
                <th className="p-5">pH Level</th>
                <th className="p-5">Turbidity</th>
                <th className="p-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-sky-50/40 transition-colors">
                  <td className="p-5 text-slate-500 font-medium">{log.date} | {log.time}</td>
                  <td className="p-5 font-bold text-sky-700">{log.ph}</td>
                  <td className="p-5 text-slate-600">{log.turbidity}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${log.status === 'Alert' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;