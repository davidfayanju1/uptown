import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { convertMeasurement } from "../../utils/sizeGuide";

const SizeGuideModal = ({
  onClose,
  modelFitNote,
  fitNote,
  sizeGuide,
  diagramImage,
}) => {
  const { unit: baseUnit, columns, rows } = sizeGuide;
  const [unit, setUnit] = useState(baseUnit);
  const [failedImage, setFailedImage] = useState(null);
  const showDiagram = diagramImage && failedImage !== diagramImage;

  useEffect(() => {
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end font-now">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Size Guide"
        className="relative w-full max-h-[92vh] overflow-y-auto bg-white rounded-t-[1.25rem] shadow-2xl animate-policy-slide-up"
      >
        <div className="sticky top-0 z-10 flex items-center bg-white px-[1.25rem] pt-[1.25rem] pb-[0.75rem]">
          <span className="flex-1 pl-[1.75rem] text-center text-[0.6875rem] text-gray-900">
            Size Guide
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-gray-900 hover:opacity-60 transition-opacity"
          >
            <IoClose size="1.5rem" />
          </button>
        </div>

        <div className="px-[1.25rem] pb-[2.5rem]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[1.54375rem] font-bold tracking-tight text-gray-900">
              Size Guide
            </h2>

            <div className="flex items-center rounded-full bg-[#f2f2f2] p-[0.1875rem]">
              {["cm", "in"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setUnit(option)}
                  aria-pressed={unit === option}
                  className={`rounded-full px-[1.125rem] py-[0.5rem] text-[0.60625rem] transition-colors ${
                    unit === option
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {modelFitNote && (
            <p className="mt-[1.75rem] text-[0.60625rem] font-bold uppercase tracking-[0.06em] text-[#8f7355]">
              {modelFitNote}
            </p>
          )}

          <h3 className="mt-[1.75rem] text-[0.95rem] font-bold text-gray-900">
            Garment Measurement
          </h3>

          {showDiagram ? (
            <img
              src={diagramImage}
              alt="Where each garment measurement is taken"
              onError={() => setFailedImage(diagramImage)}
              className="mt-[1rem] mx-auto max-h-[15rem] w-auto max-w-full object-contain"
            />
          ) : (
            <div className="mt-[1rem] flex h-[10rem] items-center justify-center rounded-[0.5rem] bg-[#f2f2f2] text-[0.6875rem] text-gray-500">
              No image
            </div>
          )}

          <div className="mt-[1.5rem] overflow-x-auto">
            <table className="w-full border-collapse text-[0.6875rem]">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-[0.5rem] py-[0.625rem] font-bold text-gray-900">
                    Size
                  </th>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="border border-gray-300 px-[0.5rem] py-[0.625rem] font-bold text-gray-900"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label}>
                    <th className="border border-gray-300 px-[0.5rem] py-[0.5rem] font-bold text-gray-900">
                      {row.label}
                    </th>
                    {columns.map((column) => (
                      <td
                        key={column}
                        className="border border-gray-300 px-[0.5rem] py-[0.5rem] text-center text-gray-700"
                      >
                        {convertMeasurement(row.values[column], baseUnit, unit)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {fitNote && (
            <>
              <h3 className="mt-[2rem] text-[0.95rem] font-bold text-gray-900">
                Fit &amp; Silhouette
              </h3>
              <p className="mt-[0.5rem] text-[0.79375rem] leading-[1.7] text-justify text-gray-500">
                {fitNote}
              </p>
            </>
          )}

          <p className="mt-[1.75rem] text-[0.95rem] font-bold text-gray-900 underline underline-offset-4">
            Still not sure about your fit &amp; sizing? Try out our size
            calculator
          </p>
        </div>
      </div>
    </div>
  );
};

export default SizeGuideModal;
