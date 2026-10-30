import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FileText,
  Download,
  Search,
  Eye,
  X,
  Upload,
  Trash2,
  AlertCircle,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import {
  fetchMedicalRecords,
  uploadMedicalRecord,
  removeMedicalRecord,
} from "../../redux/slice/medicalRecordSlice";

// Use shared image URL resolver for medical record files
import { getImageUrl } from "../../utiles/imageURL";

const MedicalRecords = () => {
  const dispatch = useDispatch();
  const { records = [], loading, error } = useSelector(
    (state) => state.medicalRecords
  );

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Lab Report");
  const [doctorName, setDoctorName] = useState("");
  const [facility, setFacility] = useState("");
  const [summary, setSummary] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    dispatch(fetchMedicalRecords());
  }, [dispatch]);

  const categories = [
    "All",
    "Lab Report",
    "Imaging",
    "Vaccination",
    "Doctor Note",
    "Discharge Summary",
  ];

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const recordTitle = record.title || "";
      const fac = record.facility || record.hospital || "";
      const matchesSearch =
        recordTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fac.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || record.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [records, searchTerm, selectedCategory]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setUploading(true);
      const data = new FormData();
      data.append("title", title);
      data.append("category", category);
      data.append("doctorName", doctorName);
      data.append("facility", facility);
      data.append("summary", summary);
      if (selectedFile) {
        data.append("file", selectedFile);
      }

      const res = await dispatch(uploadMedicalRecord(data));
      if (!res.error) {
        setShowUploadModal(false);
        setTitle("");
        setDoctorName("");
        setFacility("");
        setSummary("");
        setSelectedFile(null);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this medical document?")) {
      dispatch(removeMedicalRecord(id));
      if (selectedRecord?._id === id) {
        setSelectedRecord(null);
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/60 bg-teal-50/70 px-3 py-1 text-[11px] font-semibold text-teal-800">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
            <span>Encrypted Health Record Vault</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Medical Records & Diagnostics
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Diagnostic lab reports, radiological imaging, and physician clinical notes
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.99]"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents or clinics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-8.5 pr-3 text-xs text-slate-800 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/10"
          />
        </div>
      </div>

      {/* Record List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
          <p className="mt-3 text-xs font-semibold text-slate-500">
            Accessing clinical vault...
          </p>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-14 text-center">
          <FileText className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-3 text-sm font-bold text-slate-800">
            No Records on File
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Upload your clinical reports to maintain a centralized diagnostic history.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((record) => {
            const id = record._id || record.id;
            const fileHref = record.fileUrl
              ? record.fileUrl.startsWith("http")
                ? record.fileUrl
                : `${API_BASE}${record.fileUrl}`
              : null;

            return (
              <div
                key={id}
                className="group flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs transition duration-200 hover:border-teal-500/40 hover:shadow-md sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 text-teal-700">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {record.title}
                      </h3>
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {record.category || "Report"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Facility: {record.facility || "Central Diagnostic Lab"}{" "}
                      {record.doctorName && `• Prescribed by ${record.doctorName}`}
                    </p>
                    {record.summary && (
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {record.summary}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0">
                  <button
                    onClick={() => setSelectedRecord(record)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Eye className="h-3.5 w-3.5 text-slate-500" />
                    <span>Details</span>
                  </button>
                  {fileHref && (
                    <a
                      href={fileHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 transition hover:bg-teal-100"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(id)}
                    className="rounded-xl p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="rounded-xl bg-teal-50 p-2.5 text-teal-700">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Upload Clinical Record
                </h3>
                <p className="text-xs text-slate-400">
                  Store lab reports, discharge summaries & scans
                </p>
              </div>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Comprehensive Metabolic Panel (CMP)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-teal-600"
                  >
                    {categories.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Facility / Hospital
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MedCare Clinic"
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Prescribing Physician
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Priya Sharma"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  File Attachment (PDF, PNG, JPG)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-teal-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-teal-700 hover:file:bg-teal-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Summary Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Primary diagnostic takeaways..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-teal-700 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Save to Vault"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <button
              onClick={() => setSelectedRecord(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-base font-bold text-slate-900">
              {selectedRecord.title}
            </h3>
            <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-4 text-xs text-slate-700">
              <p>
                <strong>Category:</strong> {selectedRecord.category}
              </p>
              <p>
                <strong>Facility:</strong>{" "}
                {selectedRecord.facility || selectedRecord.hospital || "N/A"}
              </p>
              <p>
                <strong>Physician:</strong>{" "}
                {selectedRecord.doctorName || "Not listed"}
              </p>
              <p>
                <strong>Notes:</strong> {selectedRecord.summary || "No notes"}
              </p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;