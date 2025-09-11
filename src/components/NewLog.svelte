<!-- NewLog is the '+ Console Log' button in the Editor. When cklicked, the LogModal is opened, with editMode false, which crates a new Console Log from scratch -->
<script lang="ts">
	import LogModal from './LogModal.svelte';
	import { faPlus } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

	let newLog = false;

	const toggleLog = () => {
		newLog = !newLog;
	};

	const handleClose = () => {
		newLog = false;
	};

		document.addEventListener('keypress', (e) => {
		const validKeys = ['2'];
		
		if (validKeys.includes(e.key)) {
			toggleLog();
			
			switch (e.key) {
				case '2': newLog = true; break;
			}
		}
	});
</script>

<button on:click={toggleLog} class="btn btn-sm bg-primary-900 flex gap-2">
	<FontAwesomeIcon icon={faPlus} /> Console Log
</button>

{#if newLog}
	<LogModal editMode={false} isOpen={newLog} variableId={null} on:close={handleClose} />
{/if}
