import Header from "@/components/header.js";
import MainSection from './main-section.js';
import Footer from "@/components/footer.js";

export default function Pumps() {
	return(
		<div className="font-sans">
			<Header activeTab={'Pumps'} />
	    	<MainSection />
	    	<Footer />
	    </div>
	)
}