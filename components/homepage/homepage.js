import Header from "@/components/header.js";
import Fold1 from "@/components/homepage/fold1.js";
import Fold2 from "@/components/homepage/fold2.js";
import Fold3 from "@/components/homepage/fold3.js";
import Fold4 from "@/components/homepage/fold4.js";
import Fold5 from "@/components/homepage/fold5.js";
import Footer from "@/components/footer.js";

export default function Homepage() {
	return(
		<div className="font-sans">
			<Header activeTab={'Home'} />
			<Fold1 />
			<Fold2 />
			<Fold3 />
			<Fold4 />
			<Fold5 />
			<Footer />
		</div>
	)
}