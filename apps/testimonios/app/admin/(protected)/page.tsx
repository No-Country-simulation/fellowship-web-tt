import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminPage() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center items-center px-sm py-md">
      <p className="text-body-large text-text-secondary">
        Elegí un envío de la lista para revisar el quote, el caption y cómo
        queda en Discord e Instagram.
      </p>
    </div>
  );
}
