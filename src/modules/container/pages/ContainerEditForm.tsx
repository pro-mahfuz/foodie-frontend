import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Select from "react-select";
import { ArrowLeftIcon, ListBulletIcon, PencilIcon } from "@heroicons/react/20/solid";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Label from "../../../components/form/Label";
import Input from "../../../components/form/input/InputField";
import DatePicker from "../../../components/form/date-picker.tsx";
import Button from "../../../components/ui/button/Button";
import { selectStyles } from "../../types.ts";
import { fetchById, update } from "../features/containerThunks";
import { AppDispatch } from "../../../store/store";
import { selectUserById } from "../../user/features/userSelectors";
import { selectAuth } from "../../auth/features/authSelectors";
import { Container, ContainerLifecycleStatus } from "../features/containerTypes.ts";
import { selectContainerById } from "../features/containerSelectors";

const lifecycleStatuses: ContainerLifecycleStatus[] = ["Draft", "In Transit", "Arrived", "Customs Clearance", "Available", "Closed", "Inactive"];
const statusOptions = lifecycleStatuses.map((status) => ({ label: status, value: status }));
const emptyContainer: Container = {
  id: undefined, businessId: 0, date: "", blNo: "", soNo: "", oceanVesselName: "", voyageNo: "", agentDetails: "",
  placeOfReceipt: "", portOfLoading: "", portOfDischarge: "", placeOfDelivery: "", containerNo: "", sealNo: "",
  description: "", status: "Draft", isActive: true, createdUserId: 0,
};

export default function ContainerEditForm() {
  const { id } = useParams();
  const containerId = Number(id);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const authUser = useSelector(selectAuth);
  const user = useSelector(selectUserById(Number(authUser.user?.id)));
  const container = useSelector(selectContainerById(containerId));
  const [formData, setFormData] = useState<Container>(emptyContainer);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (containerId) dispatch(fetchById(containerId));
  }, [containerId, dispatch]);

  useEffect(() => {
    if (container) {
      setFormData({ ...emptyContainer, ...container, status: container.status ?? (container.isActive ? "Available" : "Inactive"), updatedUserId: user?.id });
    }
  }, [container, user?.id]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setLoading(true);
      await dispatch(update({ ...formData, id: containerId, isActive: formData.status !== "Inactive" })).unwrap();
      toast.success("Container updated successfully!");
      navigate("/container/0/list");
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to update container.");
    } finally {
      setLoading(false);
    }
  };

  const statusClass = formData.status === "Available"
    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
    : formData.status === "Inactive" || formData.status === "Closed"
      ? "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300"
      : "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300";

  return (
    <div className="mx-auto max-w-7xl">
      <PageMeta title="Edit Container" description="Update container shipment and lifecycle information" />
      <PageBreadcrumb pageTitle="Edit Container" />

      <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Shipment management</p>
            <div className="mt-1 flex flex-wrap items-center gap-3"><h1 className="text-xl font-semibold text-gray-900 dark:text-white">Edit container</h1><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>{formData.status}</span></div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{formData.containerNo ? `Update shipment details for container ${formData.containerNo}.` : "Update shipment details and track the container lifecycle."}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ArrowLeftIcon className="h-4 w-4" /> Back</button>
            <button type="button" onClick={() => navigate("/container/0/list")} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-white/[0.12] dark:text-gray-300"><ListBulletIcon className="h-4 w-4" /> All containers</button>
          </div>
        </div>
      </section>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-6">
          <div className="mb-5 border-b border-gray-100 pb-4 dark:border-white/[0.08]"><h2 className="font-semibold text-gray-900 dark:text-white">Container details</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update the main identifier, date, seal, and lifecycle stage.</p></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <DatePicker key={formData.date} id="container-date" label="Date" placeholder="Select a date" defaultDate={formData.date} onChange={(_, date) => setFormData((prev) => ({ ...prev, date }))} />
            <div><Label>Container No <span className="text-error-500">*</span></Label><Input name="containerNo" value={formData.containerNo} onChange={handleChange} required /></div>
            <div><Label>Seal No</Label><Input name="sealNo" value={formData.sealNo} onChange={handleChange} /></div>
            <div><Label>Lifecycle status</Label><Select options={statusOptions} value={statusOptions.find((option) => option.value === formData.status)} onChange={(option) => setFormData((prev) => ({ ...prev, status: option?.value ?? "Draft" }))} styles={selectStyles} classNamePrefix="react-select" /></div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-6">
            <div className="mb-5 border-b border-gray-100 pb-4 dark:border-white/[0.08]"><h2 className="font-semibold text-gray-900 dark:text-white">Shipment reference</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Document and vessel information for this shipment.</p></div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div><Label>B.L. No <span className="text-error-500">*</span></Label><Input name="blNo" value={formData.blNo} onChange={handleChange} required /></div>
              <div><Label>S.O. No</Label><Input name="soNo" value={formData.soNo} onChange={handleChange} /></div>
              <div><Label>Vessel name <span className="text-error-500">*</span></Label><Input name="oceanVesselName" value={formData.oceanVesselName} onChange={handleChange} required /></div>
              <div><Label>Voyage No</Label><Input name="voyageNo" value={formData.voyageNo} onChange={handleChange} /></div>
              <div className="sm:col-span-2"><Label>Agent details</Label><Input name="agentDetails" value={formData.agentDetails} onChange={handleChange} /></div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.08] dark:bg-white/[0.03] sm:p-6">
            <div className="mb-5 border-b border-gray-100 pb-4 dark:border-white/[0.08]"><h2 className="font-semibold text-gray-900 dark:text-white">Notes</h2><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update any operational instructions or shipment notes.</p></div>
            <Label>Description</Label>
            <textarea value={formData.description} onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))} placeholder="Add shipment notes or instructions" rows={7} className="mt-1 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 outline-none focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white" />
          </section>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-5 dark:border-white/[0.08]"><Button type="button" variant="outline" onClick={() => navigate("/container/0/list")}>Cancel</Button><Button type="submit" variant="success" disabled={loading}><span className="inline-flex items-center gap-2"><PencilIcon className="h-4 w-4" /> {loading ? "Saving..." : "Save changes"}</span></Button></div>
      </form>
    </div>
  );
}
