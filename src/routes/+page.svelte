<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { user } from '$lib/auth';

	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
	import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

	onMount(() => {
		// Subscribe to the user store to check if a user is logged in
		let unsubscribe = user.subscribe((currentUser) => {
			if (currentUser) {
				// If user is logged in, redirect to dashboard
				goto('/dashboard');
			}
		});

		// Cleanup the subscription when the component is destroyed
		return () => unsubscribe();
	});
</script>

<div class="container my-0 sm:my-4 lg:my-8 mx-auto flex flex-col items-center">
	<div class="card xl:w-1/2 lg:p-4 rounded-none sm:rounded-2xl">
		<header class="card-header"><h2 class="text-4xl md:text-6xl">Curious about Code?</h2></header>
		<hr class="opacity-50 my-2" />
		<section class="p-4 text-sm lg:text-lg">
			You've come to the right place! <strong>Code Curious</strong> is your interactive resource for
			learning the basics of programming—in a fun and friendly environment.
		</section>
		<hr class="opacity-50 my-2" />
		<section class="p-4 text-sm lg:text-lg flex flex-col items-start">
			<h3 class="text-xl">Already Have an Account?</h3>
			<p class="mt-2 mb-4">What are you waiting for?</p>
			<a href="/sign-in" class="btn bg-primary-700 flex gap-2"
				><FontAwesomeIcon icon={faArrowRight} />Sign In</a
			>
		</section>
		<hr class="opacity-50 my-2" />

		<section class="p-4 text-sm lg:text-lg flex flex-col items-start">
			<h3 class="text-xl">Benefits of Signing Up</h3>
			<ul class="list-disc list-inside mt-2 mb-4">
				<li>Unlock more lessons</li>
				<li>Save your work</li>
			</ul>
			<a href="/sign-up" class="btn bg-primary-700 flex gap-2"
				><FontAwesomeIcon icon={faArrowRight} />Sign Up</a
			>
		</section>

		<hr class="opacity-50 my-2" />

		<section class="p-4 text-sm lg:text-lg flex flex-col items-start">
			<h3 class="text-xl">Keeping It Casual?</h3>
			<p class="mt-2 mb-4">No problem! You can access all beginner lessons without an account.</p>
			<a href="/tutorial/welcome" class="btn bg-primary-700 flex gap-2"
				><FontAwesomeIcon icon={faArrowRight} />Start Learning</a
			>
		</section>

	</div>
</div>
