<!-- NewVariable is the 'New Variable' button in the Editor. When a type is cklicked, the corresponding modal object is opened -->
<script lang="ts">
	import StringModal from './StringModal.svelte';
	import NumberModal from './NumberModal.svelte';
	import BooleanModal from './BooleanModal.svelte';
	import ObjectModal from './ObjectModal.svelte';
	import ArrayModal from './ArrayModal.svelte';
	import { faPlus } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

	let showMenu = false;
	const toggleMenu = () => {
		showMenu = !showMenu;
	};

	let newString = false;
	let newNumber = false;
	let newBoolean = false;
	let newObject = false;
	let newArray = false;

	const handleClose = () => {
		newString = false;
		newNumber = false;
		newBoolean = false;
		newObject = false;
		newArray = false;
	};

	const stringKey = document.addEventListener('keypress', (e) => {

		if (e.key === 's') {
			console.log('Du har skrivit ett S')
		}

	})

</script>

<div class="flex flex-col gap-2">
	<div class="flex">
		<div>
			<button on:click={toggleMenu} class="btn btn-sm bg-primary-900 flex gap-2">
				<FontAwesomeIcon icon={faPlus} /> Variable
			</button>
		</div>
		{#if showMenu}
			<div class="flex flex-wrap">
				<button
					class="btn btn-sm"
					on:click={() => {
						toggleMenu();
						newString = true;
					}}>String</button
				>
				<button
					class="btn btn-sm"
					on:click={() => {
						toggleMenu();
						newNumber = true;
					}}>Number</button
				>
				<button
					class="btn btn-sm"
					on:click={() => {
						toggleMenu();
						newBoolean = true;
					}}>Boolean</button
				>
				<button
					class="btn btn-sm"
					on:click={() => {
						toggleMenu();
						newObject = true;
					}}>Object</button
				>
				<button
					class="btn btn-sm"
					on:click={() => {
						toggleMenu();
						newArray = true;
					}}>Array</button
				>
			</div>
		{/if}
	</div>
</div>
{#if newString}
	<StringModal editMode={false} isOpen={newString} variableId={undefined} on:close={handleClose} />
{/if}
{#if newNumber}
	<NumberModal editMode={false} isOpen={newNumber} variableId={undefined} on:close={handleClose} />
{/if}
{#if newBoolean}
	<BooleanModal editMode={false} isOpen={newBoolean} variableId={null} on:close={handleClose} />
{/if}
{#if newObject}
	<ObjectModal editMode={false} isOpen={newObject} variableId={null} on:close={handleClose} />
{/if}
{#if newArray}
	<ArrayModal editMode={false} isOpen={newArray} variableId={null} on:close={handleClose} />
{/if}
