---
title: "Reverse-Engineering the Wetware: Spiking Networks, TD Errors, and the End of Matrix Math"
description: ""
author: "Pedro Teixeira"
date: 2026-03-01
tags: ["AI & ML", "Computational Psychiatry"]
image: "/images/blog/astronaut-neurons.png"
---

![Astronaut and neurons](/images/blog/astronaut-neurons.png)


If you’ve been following my recent posts on Metaduck, you know I spend my days building infrastructure for AI agents and wrangling LLMs into production. As software engineers, we’re used to treating neural networks as massive, static mathematical graphs powered by [backpropagation](https://en.wikipedia.org/wiki/Backpropagation) and matrix multiplication running on beefy GPUs (e.g. with [PyTorch](https://pytorch.org/) or similar).

But lately, I’ve been diving deep into computational neuroscience (shoutout to the [Computational Psychiatry course](https://www.coursera.org/learn/computational-psychiatry) that sent me down this rabbit hole). And it turns out, the biological wetware in our skulls works fundamentally differently than the models we build in PyTorch.

Today, I want to give you an engineer-friendly introduction to how the human brain *actually* processes information, how it learns without using calculus, and what this means for the future of AI. Let’s debug the most complex system we know.

### 1. The Mind’s Eye and the Hallucination Machine

In AI, we usually think of perception as a bottom-up process: you feed an image of an apple into a [CNN](https://en.wikipedia.org/wiki/Convolutional_neural_network), the early layers detect edges and colors, and the final layer outputs an "embedding"—a dense vector representing the abstract concept of "apple-ness."

But human perception isn't just a passive conveyor belt. It's heavily **top-down**. When you *imagine* an apple (your "mind's eye"), your brain runs the process in reverse. Your higher-level executive networks and memory centers (the embedding layer) send a signal backward down into your [Primary Visual Cortex (V1)](https://en.wikipedia.org/wiki/Visual_cortex#Primary_visual_cortex_(V1)), forcing those early edge-and-color neurons to fire. You literally simulate the sensory experience. *(Fun fact: if this feedback loop is physically missing or disconnected, you have Aphantasia—a complete inability to voluntarily visualize mental imagery [1].)*

![Projected Reality](/images/blog/projected-reality.png)

This top-down feedback loop is the core of [**Predictive Coding**](https://doi.org/10.1038/nrn2787) [2]. The brain isn't passively waiting for pixels from the optic nerve. It is a "hallucination machine" constantly generating a simulation of the world. When you look at a tree, your brain predicts what it's going to see. It compares that top-down prediction with the bottom-up sensory data from your eyes. The brain doesn't pass the whole image up the chain; it only passes up the **prediction errors** (the diffs). Your conscious experience is just your brain's best guess of reality, corrected by sensory diffs.

### 2. Why Backpropagation Fails Biology

So, how does this meat-computer learn?

In standard Machine Learning, we use [**Backpropagation**](https://en.wikipedia.org/wiki/Backpropagation). It's an omniscient global coach. When the network makes a mistake, we calculate a global error gradient and pass it backward, updating every single weight perfectly using calculus.

The human brain physically cannot do this. A biological synapse is a one-way street; it can't mathematically pass a gradient backward. Plus, the brain has a massive "Credit Assignment Problem." If you swing a tennis racket and miss, how does a specific neuron in layer 2 of your visual cortex know it was the one that messed up?

Instead of global calculus, the brain uses **local learning**, specifically [**Spike-Timing-Dependent Plasticity (STDP)**](https://www.jneurosci.org/content/18/24/10464) [3].
Biological neurons don't output continuous numbers (like `0.75`); they fire discrete, binary electrical spikes over time. STDP is a strict temporal rule:

* **Cause and Effect:** If Neuron A fires just a few milliseconds *before* Neuron B, the brain assumes A caused B. The synapse between them gets stronger.
* **Coincidence:** If A fires *after* B, the connection weakens.

![The Precise Pulse](/images/blog/precise-pulse.png)

It’s completely decentralized. Every synapse updates its own weight based strictly on local rhythm and timing.

### 3. The Ultimate Crossover: Dopamine and the TD Error

Local STDP is great for wiring a visual cortex, but it's "blind" to goals. It will happily wire your brain to memorize TV static if you stare at it long enough. To learn complex behaviors, the brain introduces a third factor: **Dopamine**.

Here is where computer science and neuroscience perfectly collided. In the 80s, AI engineers invented a [Reinforcement Learning](https://en.wikipedia.org/wiki/Reinforcement_learning) algorithm called [**Temporal Difference (TD) Learning**](http://incompleteideas.net/book/the-book-2nd.html) to train software agents [4]. A decade later, neuroscientists measuring monkey brains realized that dopamine neurons fire in a pattern that *perfectly matches the [TD Error](https://doi.org/10.1126/science.275.5306.1593) equation* [5].

![Decoding Dopamine Diffs](/images/blog/decoding-dopamine-diffs.png)

Dopamine is not "pleasure." It is a **Reward Prediction Error (RPE)**.

* **Unexpected reward:** Massive dopamine spike (Positive TD Error: *"Update the weights!"*).
* **Expected reward:** Dopamine spikes when the *bell rings*, but not when the reward arrives (Zero TD Error: *"Exactly as predicted, no need to learn"*).
* **Expected reward omitted:** A sudden drop in baseline dopamine (Negative TD Error: *"Prediction failed, weaken those synapses"*).

AI engineers literally translate this localized dopamine release into computer code (using [Q-Learning](http://incompleteideas.net/book/the-book-2nd.html) algorithms) to train agents to beat games like Go or navigate robots.

### 4. The Hardware Reality: GPUs vs. Neuromorphic Chips

If STDP and biological learning are so elegant, why aren't we running ChatGPT on them?

Because we live in a GPU world. GPUs are highly optimized for deterministic matrix multiplication. They are terrible at handling the discrete, time-based binary spikes of biology ([Spiking Neural Networks (SNNs)](https://en.wikipedia.org/wiki/Spiking_neural_network)), and they absolutely *hate* Bayesian uncertainty.

When AI researchers try to model uncertainty, they often use hacks like the [**Reparameterization Trick**](https://arxiv.org/abs/1312.6114) (from VAEs) or [Monte Carlo Dropout](https://arxiv.org/abs/1506.02142) [6] just to make the math run on a GPU. But this forces the network into a "Gaussian straitjacket," limiting its ability to hold complex, discrete, multi-peaked hypotheses (like knowing a blurry shape could be a dog *or* a cat, but definitely not a smooth mathematical average of both).

To truly build a biological, predictive brain, we are looking toward [**Neuromorphic chips**](https://en.wikipedia.org/wiki/Neuromorphic_engineering) like [Intel's Loihi 2](https://www.intel.com/content/www/us/en/research/neuromorphic-computing.html) [7] or [SpiNNaker](https://apt.cs.manchester.ac.uk/projects/SpiNNaker/). These physical microchips don't do matrix math. They use artificial "silicon synapses" to send electrical spikes and natively perform 3-factor STDP in hardware, using a fraction of a watt.

![The Silicon Synapse](/images/blog/silicon-synapse.png)

### 5. Beating the "Depth" Wall without Calculus

Even with dopamine, STDP struggles to train massive, deep networks (the Credit Assignment Problem rears its head again). If your brain doesn't use backprop, how do you learn to play the piano or write code?

Neuro-AI researchers are exploring a few brilliant theories that simulate backpropagation using local rules:

* **[Target Propagation](https://arxiv.org/abs/1407.7906):** Instead of passing an error gradient backward, the network passes a "target state" backward [8]. The motor cortex tells the layer below it, *"Hey, I really wished you had sent me THIS signal instead."* The lower layer uses local STDP to adjust itself closer to that wishlist.
* **[Feedback Alignment](https://doi.org/10.1038/ncomms13276):** Turns out, if you send error signals backward through completely *random, fixed wires* (instead of symmetrical weights like backprop requires), the forward-facing neurons will organically adjust themselves to "align" with that random feedback [9]. The brain doesn't need perfect math; it just needs a directional nudge.

### Wrapping Up

We are currently watching AI and neuroscience completely converge. By combining the Bayesian/Predictive brain (to understand the world), Spiking Neural Networks (to process it in time), Local STDP (to wire the neurons), and Localized Dopamine (to give the system a goal), we have an actual blueprint for biological intelligence.

![The Blueprint Emerges](/images/blog/blueprint-emerges.png)

If you’re AI-curious and want to tinker with these concepts in code, check out open-source projects like [**Nengo**](https://www.nengo.ai/) (for building large-scale spiking networks) or [**pymdp**](https://github.com/infer-actively/pymdp) (for [Active Inference](https://en.wikipedia.org/wiki/Active_inference) and predictive coding).

Until next time, keep debugging.

Pedro

---

### References

* **[1] Zeman, A., Dewar, M., & Della Sala, S. (2015).** *[Lives without imagery – Congenital aphantasia](https://doi.org/10.1016/j.cortex.2015.05.019)*. Cortex, 73, 378-380. (The foundational paper formally defining and naming the condition of aphantasia).
* **[2] Friston, K. (2010).** *[The free-energy principle: a unified brain theory?](https://doi.org/10.1038/nrn2787)* Nature Reviews Neuroscience, 11(2), 127-138. (The seminal paper establishing the mathematics behind the brain as a predictive/hallucination machine).
* **[3] Bi, G. Q., & Poo, M. M. (1998).** *[Synaptic modifications in cultured hippocampal neurons: dependence on spike timing, synaptic strength, and postsynaptic cell type](https://www.jneurosci.org/content/18/24/10464)*. Journal of Neuroscience, 18(24), 10464-10472. (One of the earliest and most famous experimental proofs of Spike-Timing-Dependent Plasticity).
* **[4] Sutton, R. S., & Barto, A. G. (1998/2018).** *[Reinforcement Learning: An Introduction](http://incompleteideas.net/book/the-book-2nd.html)*. MIT Press. (The foundational textbook that established Temporal Difference Learning and Q-Learning in computer science).
* **[5] Schultz, W., Dayan, P., & Montague, P. R. (1997).** *[A neural substrate of prediction and reward](https://doi.org/10.1126/science.275.5306.1593)*. Science, 275(5306), 1593-1599. (The historic breakthrough paper proving that biological dopamine perfectly mirrors the artificial TD Error equation).
* **[6] Gal, Y., & Ghahramani, Z. (2016).** *[Dropout as a Bayesian Approximation: Representing Model Uncertainty in Deep Learning](https://arxiv.org/abs/1506.02142)*. ICML. (The mathematical proof that keeping Dropout turned on during inference simulates a Bayesian network on standard GPUs).
* **[7] Davies, M., et al. (2018).** *[Loihi: A Neuromorphic Manycore Processor with On-Chip Learning](https://doi.org/10.1109/MM.2018.112130359)*. IEEE Micro, 38(1), 82-99. (Intel's architectural breakdown of how their neuromorphic chips calculate STDP in hardware).
* **[8] Bengio, Y. (2014).** *[How Auto-Encoders Could Provide Credit Assignment in Deep Networks via Target Propagation](https://arxiv.org/abs/1407.7906)*. arXiv preprint arXiv:1407.7906. (The paper proposing Target Propagation as a biologically plausible alternative to backpropagation).
* **[9] Lillicrap, T. P., et al. (2016).** *[Random synaptic feedback weights support error backpropagation for deep learning](https://doi.org/10.1038/ncomms13276)*. Nature Communications, 7, 13276. (The DeepMind paper proving that the brain could learn using random backward wires via Feedback Alignment).
