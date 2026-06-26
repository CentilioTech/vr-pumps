import Header from "@/components/header.js";
import ShoppingCart from './shopping-cart.js';
import Footer from "@/components/footer.js";

export default function Pumps() {
	return(
		<div className="font-sans">
			<Header activeTab={'Cart'} />
	    	<ShoppingCart />
	    	<Footer />
	    </div>
	)
}