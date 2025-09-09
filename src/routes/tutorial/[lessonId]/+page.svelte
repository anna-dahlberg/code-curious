<script lang="ts">
	import { currentPanel } from '$lib/stores/store';
	import { page } from '$app/stores'; // Store for dynamic routing
	import { afterUpdate, onDestroy } from 'svelte';
	import { beforeNavigate } from '$app/navigation';
	import { fade } from 'svelte/transition';

	import { isRunning } from '$lib/stores/store';
	import { snapshot } from '$lib/stores/snapshots';
	import { actionSnapshot } from '$lib/utils/actions';
	import { clearConsole, consoleOutput, logToConsole } from '$lib/utils/consoleActions';
	import { waitForStability } from '$lib/utils/actions';
	import { ProgressBar } from '@skeletonlabs/skeleton';

	import { executeAction } from '$lib/utils/actions';
	import { supabase } from '$lib/supabaseClient';

	import { fetchLessonId } from '$lib/utils/fetchLessonId';
	import { fetchTotalLessons } from '$lib/utils/fetchTotalLessons';

	import {
		faAngleUp,
		faAngleDown,
		faAngleLeft,
		faAngleRight,
		faChalkboardUser,
		faCircleExclamation,
		faCode,
		faExclamationTriangle,
		faEye,
		faRotateRight,
		faShapes,
		faStop,
	} from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

	import Tutorial from '../../../components/Tutorial.svelte';
	import Editor from '../../../components/Editor.svelte';
	import Console from '../../../components/Console.svelte';
	import Matter from '../../../components/Matter.svelte';
	import type { LessonData, Log } from '$lib/types';

	let lessonIdNumber: number = 0;

	$: if (lessonId) {
		fetchLessonId(lessonId).then((id) => (lessonIdNumber = id));
	}

	let totalLessonsNumber: number = 0;

	$: {
		fetchTotalLessons().then((length) => (totalLessonsNumber = length));
	}

	//let lessonId = data.lessonId; // Use the lessonId passed from the load function
	let lessonId = $page.params.lessonId; // Use the lessonId from the route params
	let lessonData: LessonData = {
		tutorial: {
			title: '',
			content: [''],
			prevLesson: '',
			nextLesson: '',
		},
		editor: {
			snapshot: [],
		},
		playfiled: {
			scene: '',
		},
	};

	// Flags
	let showTutorial = false; // Flag to show tutorial after scrolling
	let hasError = false;
	let navigating = true;

	const fetchLesson = async () => {
		const { data, error } = await supabase
			.from('lessons')
			.select('*')
			.eq('slug', lessonId)
			.single();
		if (error || !data) {
			console.error('Error fetching lesson:', error || 'No data');
			hasError = true; // Set error state
			return;
		}
		hasError = false; // Clear error state if successful
		// Is successful, assign lessonData
		lessonData.tutorial = {
			title: data.title,
			content: data.content,
			prevLesson: data.prev_lesson,
			nextLesson: data.next_lesson,
		};
		if (data.snapshot) {
			lessonData.editor = {
				snapshot: data.snapshot,
			};
		} else {
			lessonData.editor = {
				snapshot: [],
			};
		}
		if (data.scene) {
			lessonData.playfiled = {
				scene: data.scene,
			};
		} else {
			lessonData.playfiled = {};
		}
	};
	fetchLesson();

	// Reactive declaration to update when the route changes
	$: if ($page.params.lessonId !== lessonId) {
		lessonId = $page.params.lessonId;
		//lessonData = data.lessonData; // Reassign the new lessonData when the route changes
		clearConsole(); // Clear the console when the route changes
		fetchLesson();
		showTutorial = false; // Hide tutorial temporarily when the route changes
	}

	// Panel width logic
	let panel1Width = 'lg:w-1/3'; // Initially 1/3 of the screen width
	let panel2Width = 'lg:w-1/3'; // Initially 1/3 of the screen width
	const panel3Width = 'lg:min-w-[450px] lg:w-1/3'; // Fixed width for the third panel

	let isPanel1Collapsed = false;

	// Function to toggle the width of the first panel
	function togglePanel1Width() {
		isPanel1Collapsed = !isPanel1Collapsed;
		panel1Width = isPanel1Collapsed ? 'lg:w-1/6' : 'lg:w-1/3'; // Change to 1/6 when collapsed
		panel2Width = isPanel1Collapsed ? 'lg:w-1/2' : 'lg:w-1/3'; // Expand panel 2 accordingly
	}

	// RUNNER function to run the user's code
	async function runner() {
		clearConsole(); // Clear the console before running the code
		$actionSnapshot = structuredClone($snapshot); // Deep clone $snapshot
		isRunning.set(true); // Set the running state to true at the start
		indicateRunning(); // Indicate that the code is running in the console
		for (const block of $actionSnapshot) {
			// If the current block has a variableId associated with it, create a deep clone of the variable
			let variable = null;
			// Log blocks can have a selectedId associated with them
			if (block.blockType === 'log' && block.selectedId) {
				variable = structuredClone($actionSnapshot.find((v) => v.id === block.selectedId));
			}

			try {
				if (block.blockType === 'variable') continue;
				if (block.blockType === 'log') await logToConsole(block, variable);
				if (block.blockType === 'action') await executeAction(block);
			} catch (error: any) {
				// Capture and log error to the Console component
				// Create a new log block with the error message
				const errorBlock: Log = {
					id: Date.now(),
					blockType: 'log',
					message: `Error: ${error.message}`,
					selectedId: null,
					selectedIndex: 0,
					selectedKey: null,
					useIndex: false,
					useKey: false,
					selectedType: 'string',
				};
				consoleOutput.update((output) => [...output, errorBlock]);
			}
		}
		// The user may have stopped running the code manually
		if (!$isRunning) return;

		// Wait for stability in matterInstance before ending run
		await waitForStability();
		indicateStopped(); // Indicate that the code has stopped running in the console
		isRunning.set(false); // Set to false when all blocks are processed and stable
	}

	// Function to stop the code execution manually
	function handleStop() {
		isRunning.set(false); // Set to false when the user stops the code manually
		indicateStopped(true); // Indicate that the code has stopped running in the console
	}

	// Indicate that the code is running in the console
	function indicateRunning() {
		const runningBlock: Log = {
			id: Date.now(),
			blockType: 'log',
			message: 'Running...',
			indicateRunning: true,
			selectedId: null,
			selectedIndex: null,
			selectedKey: null,
			useIndex: false,
			useKey: false,
		};
		consoleOutput.update((output) => [...output, runningBlock]);
	}
	// Indicate that the code has stopped running in the console,
	// either by finishing or being stopped by the user
	function indicateStopped(byUser: boolean = false) {
		// If isRunning is false at this point,
		// the user has manually stopped running the code
		// and indicateStopped() has already been called
		if (!$isRunning && !byUser) return;
		const message = byUser ? 'Stopped by user' : 'Finished';
		const stoppedBlock: Log = {
			id: Date.now(),
			blockType: 'log',
			message: message,
			indicateStopped: true,
			selectedId: null,
			selectedIndex: null,
			selectedKey: null,
			useIndex: false,
			useKey: false,
		};
		consoleOutput.update((output) => [...output, stoppedBlock]);
	}

	// Scroll tutorial content to the top when the route changes
	let scrollDiv: HTMLDivElement | null = null;

	// Run after component updates, then scroll and reveal tutorial
	afterUpdate(() => {
		if (scrollDiv && navigating) {
			// Scroll to the top
			scrollDiv.scrollTo({ top: 0 });

			//Reset navigating flag
			navigating = false;

			// Delay showing the tutorial slightly for smooth transition
			setTimeout(() => {
				showTutorial = true; // Show tutorial after scrolling completes
			}, 500); // Adjust timing if needed for smoother UX
		}
	});

	let consoleExpanded: boolean = false;

	// Function to toggle the console panel
	function toggleConsole() {
		consoleExpanded = !consoleExpanded;
	}

	// Make sure isRunning is set to false when the component is destroyed
	// and before navigating to another route
	onDestroy(() => {
		// Set $isRunning to false before leaving the route
		isRunning.set(false);
	});
	beforeNavigate(() => {
		// Set $isRunning to false before leaving the route
		isRunning.set(false);
		// Set navigating flag to true
		navigating = true;
	});

const style = document.createElement('style');
style.textContent = `
.progress-dots {
  -webkit-mask: radial-gradient(circle closest-side,#000 94%,#0000) 0 0/calc(100% / var(--total)) 100%, linear-gradient(#000 0 0) center/calc(100% - 12px) calc(100% - 12px) no-repeat;
  background: linear-gradient(#25b09b 0 0) 0/calc(var(--filled) / var(--total) * 100%) no-repeat #ddd;
}
`;
document.head.appendChild(style);
</script>

<!-- Panel 1: Lesson -->
<section
	class="bg-neutral-900 h-screen md:transition-all md:duration-250 md:ease-in-out flex flex-col {$currentPanel !==
	1
		? 'hidden'
		: ''} {panel1Width} lg:block"
>
	<div bind:this={scrollDiv} class="flex-1 overflow-y-scroll max-h-screen">
		<!-- Panel header -->
		<div
			class="w-full flex items-center justify-between space-x-4 py-3 px-4 bg-[#3a1d2a] sticky top-0 z-10"
		>
			<h2 class="flex items-center py-0 gap-4">
				<FontAwesomeIcon icon={faChalkboardUser} /> Lesson
			</h2>
			<h2>{lessonIdNumber} / {totalLessonsNumber}</h2>
			<div class="progress-dots w-[120px] h-6" 
     style="--total: {totalLessonsNumber}; --filled: {lessonIdNumber}"></div>
			<!-- Toggle Panel 1 width -->
			<button
				type="button"
				class="btn btn-sm py-0 hidden lg:inline-block"
				on:click={togglePanel1Width}
			>
				{#if isPanel1Collapsed}
					<span><FontAwesomeIcon icon={faAngleRight} /></span>
				{:else}
					<span><FontAwesomeIcon icon={faAngleLeft} /></span>
				{/if}
			</button>
		</div>
		<!-- Dynamic content start -->

		{#if hasError}
			<div class="w-full p-4 flex justify-center items-start">
				<aside class="alert variant-ghost-warning mt-4">
					<div><FontAwesomeIcon icon={faExclamationTriangle} /></div>
					<div class="alert-message">
						<p>Failed to load lesson. Please try again later.</p>
					</div>
				</aside>
			</div>
		{:else}
			<!-- Show lesson content -->
			{#if lessonData && showTutorial}
				<div in:fade={{ duration: 250 }} out:fade={{ duration: 50 }}>
					<Tutorial data={lessonData.tutorial} />
				</div>
			{:else}
				<div class="w-full p-4">
					<ProgressBar />
				</div>
			{/if}
		{/if}
	</div>
</section>

<!-- Panel 2: Editor & Console -->
<section
	class="relative w-full bg-neutral-900 lg:border-x border-zinc-700 h-screen overflow-y-hidden md:transition-all md:duration-250 md:ease-in-out {$currentPanel !==
	2
		? 'hidden'
		: ''} {panel2Width} lg:block"
>
	<!-- Editor -->
	<div>
		<div class="w-full flex items-center justify-between space-x-4 py-2 lg:py-3 px-4 bg-[#3a1d2a]">
			<h2 class="flex gap-4 items-center"><FontAwesomeIcon icon={faCode} /> Editor</h2>

			<!-- Run button, only show if currentPanel is 2, that is, not on desktop -->
			<button
				on:click={runner}
				type="button"
				disabled={$isRunning}
				class="btn btn-sm bg-primary-900 flex gap-2 {$currentPanel !== 2 ? 'hidden' : ''} lg:hidden"
			>
				{#if $isRunning}
					<FontAwesomeIcon icon={faCircleExclamation} /> Running
				{/if}
				{#if !$isRunning}
					<FontAwesomeIcon icon={faRotateRight} /> Run
				{/if}
			</button>
		</div>
		<!-- Editor content -->
		<div class="p-2">
			{#if lessonData}
				<Editor data={lessonData.editor} />
			{:else}
				<p>Loading...</p>
			{/if}
		</div>
	</div>
	<!-- Console -->
	<div class="w-full absolute bottom-0 z-40">
		<button
			type="button"
			on:click={toggleConsole}
			class="w-40 rounded-t-2xl flex items-center justify-between space-x-4 py-3 px-4 bg-[#3a1d2a]"
		>
			<h2 class="flex gap-4 items-center"><FontAwesomeIcon icon={faEye} /> Console</h2>
			<div class="btn btn-sm p-0 flex gap-2">
				{#if consoleExpanded}
					<span><FontAwesomeIcon icon={faAngleDown} /></span>
				{:else}
					<span><FontAwesomeIcon icon={faAngleUp} /></span>
				{/if}
			</div>
		</button>

		<div class="bg-zinc-800 border-t-8 border-[#3a1d2a]">
			<Console expanded={consoleExpanded} />
		</div>
	</div>
</section>

<!-- Panel 3: Playfield -->
<section
	class="bg-[#12131a] w-full h-screen lg:block {$currentPanel !== 3
		? 'hidden lg:block'
		: ''} {panel3Width} overflow-y-scroll"
>
	<div class="text-start w-full flex items-center justify-between space-x-4 py-2 px-4 bg-[#3a1d2a]">
		<h2 class="flex items-center gap-4"><FontAwesomeIcon icon={faShapes} /> Playfield</h2>
		<div class="flex gap-2">
			<!-- STOP button, if running -->
			{#if $isRunning}
				<button type="button" on:click={handleStop} class="btn btn-sm bg-primary-900 flex gap-2">
					<FontAwesomeIcon icon={faStop} /> Stop
				</button>
			{/if}
			<!-- Main RUN button -->
			<button
				type="button"
				on:click={runner}
				disabled={$isRunning}
				class="btn btn-sm bg-primary-900 flex gap-2"
			>
				{#if $isRunning}
					<FontAwesomeIcon icon={faCircleExclamation} /> Running
				{/if}
				{#if !$isRunning}
					<FontAwesomeIcon icon={faRotateRight} /> Run
				{/if}
			</button>
		</div>
	</div>
	<!-- Dynamic content start -->
	{#if lessonData}
		<Matter data={lessonData.playfiled} />
	{:else}
		<p>Loading...</p>
	{/if}
	<!-- Dynamic content end -->
</section>
