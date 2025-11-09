import {
  Button,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useState } from "react";
import { MdCalendarMonth } from "react-icons/md";
import { formatCurrency, formatDate } from "../utils";
import ImageModal from "./image-modal";

export default function OrderDetail({ order }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 1:
        return "bg-yellow-700";
      case 2:
        return "bg-blue-700";
      case 3:
        return "bg-[#245156]";
      case 4:
        return "bg-red-700";
      default:
        return "bg-gray-700";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 1:
        return "bg-red-700";
      case 2:
        return "bg-orange-700";
      case 3:
        return "bg-green-700";
      default:
        return "bg-gray-700";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return "Menunggu Konfirmasi";
      case 2:
        return "Order Dibuat";
      case 3:
        return "Order Selesai";
      case 4:
        return "Order Ditolak";
      default:
        return status;
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 1:
        return "Belum Dibayar";
      case 2:
        return "Bayar Down Payment";
      case 3:
        return "Dibayar Lunas";
      default:
        return status;
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-[40px] shadow-xl p-10">
      {/* Status */}
      <div className="flex justify-center mb-10">
        <span
          className={`${getStatusColor(order.oApprovalStatus)} text-white px-[30px] py-[10px] rounded-full font-bold font-montserrat text-base`}
        >
          {getStatusText(order.oApprovalStatus)}
        </span>
      </div>
      <div className="flex justify-center mb-10">
        <span
          className={`${getPaymentStatusColor(order.oStatusPayment)} text-white px-[30px] py-[10px] rounded-full font-bold font-montserrat text-base`}
        >
          {getPaymentStatusText(order.oStatusPayment)}
        </span>
      </div>
        {order.oApprovalStatus === 4 && (
          <>
            <p className="block text-sm text-black-500 mb-2 font-montserrat text-base">
              Alasan Order Ditolak
            </p>
            <div className="border rounded-md p-6 text-sm text-[#999] font-montserrat mb-[50px]">
              {order.oApprovalNotes}
            </div>
          </>
        )}
      {/* Progress Bar */}
      <div className="w-full bg-[#F0F2F4] h-[70px] rounded-[20px] mb-[50px]">
        {order.oProgress === 0 ? (
          <div className="flex items-center justify-center h-full text-[#245156] w-full text-center font-bold font-montserrat text-base">
            0%
          </div>
        ) : (
          <div
            className={`bg-[#245156] text-white flex items-center justify-center h-[70px] rounded-[20px]  font-bold font-montserrat text-base`}
            style={{ width: `${order.oProgress}%` }}
          >
            {Number.parseFloat(order.oProgress).toFixed(2)}%
          </div>
        )}
      </div>

      {/* Form */}
      <div className="space-y-10 flex flex-col justify-center px-[50px]">
        {order.oItems.map((item) => (
          <div
            key={item.oiId}
            className="w-full bg-white rounded-[40px] shadow-xl p-6 space-y-10 flex flex-col justify-center"
          >
            {/* Produk */}
            <div>
              <label className="block text-sm text-[#999999] font-poppins font-medium">
                Produk
              </label>
              <p className="border-b-[2px] border-[#999999] pl-7 py-2 font-poppins text-[#999999]">
                {item.cpName}
              </p>
            </div>
            <div>
              <label className="block text-sm text-[#999999] font-poppins font-medium">
                Jenis Produk
              </label>
              <p className="border-b-[2px] border-[#999999] pl-7 py-2 font-poppins text-[#999999]">
                {item.ccName}
              </p>
            </div>
            <div>
              <label className="block text-sm text-[#999999] font-poppins font-medium">
                Bahan
              </label>
              <p className="border-b-[2px] border-[#999999] pl-7 py-2 font-poppins text-[#999999]">
                {item.isName}
              </p>
            </div>

            {/* Ukuran */}
            <div>
              <label className="block text-sm text-[#999999] font-poppins font-medium mb-2">
                Ukuran
              </label>
              <div className="grid grid-cols-2 gap-y-[18px] gap-x-[10px]">
                {item.oiSizes.map((item) => (
                  <div
                    key={item.oisId}
                    className={`flex w-full h-12 rounded border text-xs font-semibold overflow-hidden border-primaryColor relative`}
                  >
                    <span
                      className={`flex items-center justify-center h-full bg-primaryColor text-white w-[40%] font-montserrat font-bold text-sm`}
                    >
                      {item.sName}
                    </span>
                    <input
                      type="number"
                      min="0"
                      className="flex items-center justify-center w-[60%] h-full bg-gray-100 text-primaryColor text-center outline-none border-0 appearance-none font-montserrat font-normal text-sm"
                      style={{ MozAppearance: "textfield" }}
                      value={item.oisAmount}
                      onWheel={(e) => e.currentTarget.blur()}
                      readOnly
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Uploads */}
            {item.oiMockupImage && (
              <div>
                <h2 className="mb-4 font-montserrat text-base font-bold text-center text-[#999999]">
                  DESIGNS / MOCK UPS
                </h2>
                <div className="space-y-4">
                  {item.oiMockupImage.map((u, i) => (
                    <div
                      key={i}
                      className="flex justify-center items-baseline gap-4"
                    >
                      <span className="font-montserrat font-bold text-sm text-[#999]">
                        Mockup {i + 1}
                      </span>
                      <ImageModal
                        src={u}
                        alt={`Mockup ${i + 1}`}
                        triggerLabel="See"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Nomer POS */}
        <div>
          <label className="block text-sm text-[#999999] font-poppins font-medium">
            Nomor POS
          </label>
          <p className="border-b-[2px] border-[#999999] pl-7 py-2 font-poppins text-[#999999]">
            {order.oPoNumber || "-"}
          </p>
        </div>

        {/* Deskripsi */}
        {order.oNotes && (
          <div className="border rounded-md p-6 text-sm text-[#999] font-montserrat">
            {order.oNotes}
          </div>
        )}

        {/* Info User */}
        <div>
          <label className="block text-sm text-[#999999] font-poppins font-medium">
            Nama
          </label>
          <p className="border-b-[2px] border-[#999999] pl-7 py-2 font-poppins text-[#999999]">
            {order.oName || "-"}
          </p>
        </div>
        <div>
          <label className="block text-sm text-[#999999] font-poppins font-medium">
            Nomor Telepon
          </label>
          <p className="border-b-[2px] border-[#999999] pl-7 py-2 font-poppins text-[#999999]">
            {order.oPhone || "-"}
          </p>
        </div>
        <div>
          <label className="block text-sm text-[#999999] font-poppins font-medium">
            Alamat Pengiriman
          </label>
          <p className="border-b-[2px] border-[#999999] pl-7 py-2 font-poppins text-[#999999]">
            {order.oAddress || "-"}
          </p>
        </div>
        <div>
          <label className="block text-sm text-[#999999] font-poppins font-medium">
            Deadline
          </label>
          <p className="border-b-[2px] border-[#999999] pl-7 py-2 font-poppins text-[#999999] flex justify-between items-center">
            <span>{formatDate(order.oDeadlineAt)}</span>
            <MdCalendarMonth color="#999" size={24} />
          </p>
        </div>

        {/* Button */}
        <div className="flex justify-center">
          {order.oStatusPayment !== 3 && order.oApprovalStatus !== 4 && <PaymentPopUpButton order={order} />}
        </div>
      </div>
    </div>
  );
}

const qrImage =
  "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ContohQR";

function PaymentPopUpButton({ order }) {
  let [isOpen, setIsOpen] = useState(false);

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  return (
    <>
      <Button
        onClick={open}
        className="bg-primaryColor text-white px-3 py-2 rounded-lg flex items-center gap-2 font-montserrat font-bold text-sm"
      >
        Bayar Sekarang
      </Button>

      <Dialog
        open={isOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={close}
      >
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel
              transition
              className="w-full max-w-xl rounded-xl bg-white p-4 duration-300 ease-out data-closed:transform-[scale(95%)] data-closed:opacity-0"
            >
              <DialogTitle
                as="h3"
                className="text-base/7 font-semibold font-montserrat mb-4"
              >
                Pembayaran
              </DialogTitle>
              <div className="flex-1 flex font-montserrat justify-end w-full p-4">
                <div
                  className={`rounded-3xl w-full flex flex-col items-center relative transition-all duration-700`}
                >
                  {/* Grid info */}
                  <div className="w-full flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1 w-full self-center">
                      <div className="mb-4">
                        <div className="text-xs text-primaryColor font-semibold mb-1">
                          ORDER NUMBER
                        </div>
                        <div className="text-base text-primaryColor mb-1">
                          {order.oNumber || "-"}
                        </div>
                        <div className="border-b border-primaryColor w-full" />
                      </div>
                      <div className="mb-4">
                        <div className="text-xs text-primaryColor font-semibold mb-1">
                          TOTAL
                        </div>
                        <div className="text-lg text-primaryColor font-bold mb-1">
                          {formatCurrency(order.ocbpsItem.ocbpsTotalOff ?? 0)}
                        </div>
                        <div className="border-b-2 border-primaryColor w-full" />
                      </div>
                      <div className="mb-4">
                        <div className="text-xs text-secondaryColor font-semibold mb-1">
                          DOWN PAYMENT
                        </div>
                        <div className="text-lg text-secondaryColor font-bold mb-1">
                          {formatCurrency(order.oDownPayment ?? 0)}
                        </div>
                        <div className="border-b-2 border-secondaryColor w-full" />
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex flex-col items-center w-full md:w-64">
                      <div className="border border-gray-200 rounded-lg p-4 w-full flex flex-col items-center">
                        <img
                          src={qrImage}
                          alt="QR Code"
                          className="w-40 h-40 object-contain mx-auto"
                        />
                        <div className="text-xs text-gray-700 font-semibold mt-2 text-center">
                          PROSPEK MITRA ABADI
                          <br />
                          NMID : ID2042316474447
                        </div>
                        <div className="text-xs text-gray-700 mt-1 text-center">
                          SATU QRIS UNTUK SEMUA
                          <br />
                          Cek aplikasi pembayaran anda
                        </div>
                        <div className="text-[10px] text-gray-700 mt-1 text-center">
                          Diterima oleh: 890805054
                          <br />
                          Versi QRIS : 1.0.2-2020
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Button
                  className="inline-flex items-center gap-2 rounded-md bg-gray-700 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:not-data-focus:outline-none data-focus:outline data-focus:outline-white data-hover:bg-gray-600 data-open:bg-gray-700 font-montserrat"
                  onClick={close}
                >
                  Tutup
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
