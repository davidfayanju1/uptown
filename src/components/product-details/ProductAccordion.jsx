import React, { useState } from "react";

// The stacked grey rows under the size picker. Only one section is open at a
// time, and its body sits directly beneath its own row.
const ProductAccordion = ({ sections }) => {
  const [openId, setOpenId] = useState(null);
  const visible = sections.filter((section) => section.content);

  if (visible.length === 0) return null;

  return (
    <div className="mt-[1.75rem] space-y-[0.5rem]">
      {visible.map((section) => {
        const isOpen = openId === section.id;

        return (
          <div key={section.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : section.id)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 bg-[#f2f2f2] px-[1.25rem] py-[1.5rem] text-left transition-colors hover:bg-[#ececec]"
            >
              <span className="font-now text-[0.8125rem] uppercase tracking-[0.02em] text-gray-900">
                {section.title}
              </span>
              <span
                aria-hidden="true"
                className="text-[0.875rem] leading-none text-gray-600"
              >
                {isOpen ? "∨" : "›"}
              </span>
            </button>

            {isOpen && (
              <div className="bg-white px-[1.25rem] pt-[1.5rem] pb-[0.5rem]">
                <h3 className="font-now text-[0.9375rem] font-bold uppercase tracking-[0.01em] text-gray-900">
                  {section.title}
                </h3>
                <div className="mt-[0.75rem] font-now text-[0.9375rem] leading-[1.6] text-justify text-[#4b5563] [&_ul]:list-disc [&_ul]:pl-[1.25rem] [&_li]:mb-1 [&_p]:mb-2">
                  {typeof section.content === "string" ? (
                    <p>{section.content}</p>
                  ) : (
                    section.content
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProductAccordion;
