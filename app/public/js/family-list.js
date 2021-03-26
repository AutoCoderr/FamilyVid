function displayDemandForm(id) {
	const elem = document.querySelector("#family-"+id+" div");
	elem.style.display = elem.style.display === "block" ? "none" : "block";
}
