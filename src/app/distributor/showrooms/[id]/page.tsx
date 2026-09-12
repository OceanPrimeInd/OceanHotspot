// @ts-nocheck
import DistributorShowroomPublic from "@/page-components/distributor/DistributorShowroomPublic";

export const dynamic = "force-dynamic";

export default function Page({ params }: { params: { id: string } }) {
  return <DistributorShowroomPublic distributorId={params.id} />;
}
