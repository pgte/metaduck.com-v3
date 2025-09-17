---
title: "CPC Afterburn: The Code Behind the Brain"
description: "A software engineer's deep dive into the core computational models that power modern psychiatry, exploring how code, math, and neuroscience come together to decode the brain's mysteries."
author: "Pedro Teixeira"
date: 2025-09-17
tags: ["Computational Psychiatry", "AI & ML"]
image: "/images/blog/astronaut-brain-computer.jpg"
---

![Astronaut and brain](/images/blog/astronaut-brain-computer.jpg)

### From Code to Cognition: The Models of Computational Psychiatry 🧠

As a software engineer who recently dove into the world of Computational Psychiatry, I wanted to follow up on my initial post about the course with a deeper dive into the "what" and "how" of this fascinating field.

In my intro post, I mentioned that computational psychiatry is all about applying **computational models** to understand how the brain works—or, more accurately, how it breaks down in mental illness. But what exactly are these models? Think of them less like a static blueprint and more like a dynamic, testable hypothesis you can code.

They are the "why" behind the "what" of psychiatric symptoms. Why might someone with a certain condition be more impulsive? Or why do they struggle to learn from their mistakes? A computational model proposes a possible mechanism, expressed in code and math, that you can then test against real-world data, like brain scans or behavioral task results.

---

### The Software Stack of the Mind

If you think of the brain as a complex system, these models are like different components of the stack. Just like we have models for network architecture, data flow, and user interaction, computational psychiatry has models for different mental processes. The course categorized them into three main areas: Perception, Action Selection & Learning, and Connectivity.

#### Models of Perception 🧠

These models are the "front-end" of the mind, dealing with how the brain takes in sensory data and forms a model of reality.

- **Predictive Coding:** This is a big one. Imagine your brain is constantly running an algorithm to predict what will happen next. When reality (the sensory input) doesn't match the prediction, it generates a **prediction error**. This error is what drives learning and updates your internal model of the world. Think of it like a neural network constantly trying to minimize its loss function.
- **Hierarchical Gaussian Filter (HGF):** This is a more complex Bayesian model that helps us understand how the brain infers hidden states in the environment. For example, it can model how a person's belief about the "volatility" of their environment changes over time. In a software context, you can think of this as a probabilistic state-machine with hidden variables. To dive deeper, check out this tutorial on the **[HGF on GitHub](https://github.com/ComputationalPsychiatry/pyhgf)**.

#### Models of Action Selection & Learning 🕹️

This is where things get really interesting for engineers. These models look at how the brain decides what to do next and how it learns from the outcomes.

- **Reinforcement Learning (RL):** If you've ever played with an RL agent, this will feel familiar. These models explain how we learn to make a sequence of decisions to maximize a cumulative reward. They're used to study things like addiction, where the brain's reward system seems to go awry. For a great introduction, take a look at the **[MIT Computational Tutorial on Reinforcement Learning](https://ocw.mit.edu/courses/res-9-008-brain-and-cognitive-sciences-computational-tutorials/pages/3-reinforcement-learning/)**.
- **Active Inference:** This is a powerful, unified theory. It proposes that the brain is fundamentally trying to minimize "free energy," which is a proxy for surprise. The brain essentially acts to minimize the difference between its predictions and what it observes. This can be a mind-bending concept, but it provides a framework for both perception and action in a single, elegant model. It's like a grand, universal optimization problem the brain is constantly solving. Here's a helpful **[step-by-step tutorial on active inference](https://pmc.ncbi.nlm.nih.gov/articles/PMC8956124/)**.

#### Models of Connectivity 🕸️

Here, we get into the architecture of the brain itself—how different modules (brain regions) talk to each other.

- **Dynamic Causal Modeling (DCM):** This is a method for inferring the _effective connectivity_ between brain regions from neuroimaging data. Unlike simply looking at a static network, DCM tries to model the causal influence one region has on another. As a software architect, you can think of this as trying to reverse-engineer the "API calls" and data flow between different microservices in a distributed system. For a technical deep dive, explore this **[explanation of DCM](https://brainresearch.de/Methods/fMRI/Analysis/DCM.html)**.

---

### The Computational Psychiatrist's Toolbox: A Summary Table

Here's a quick reference table to help you make sense of all these models and how they relate to what we do.

<div class="overflow-x-auto">

| 🧠 **Model Type**                            | 📊 **Mathematical Foundation**                                                          | 📝 **Description**                                                                                                                                                                                                                                                                             | 🎯 **Examples**                                                                                                                                                                                          |
| :------------------------------------------- | :-------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **🔍 Models of Perception**                  |                                                                                         |                                                                                                                                                                                                                                                                                                |                                                                                                                                                                                                          |
| **Hierarchical Gaussian Filter (HGF)**       | `Bayesian inference`<br>`Hierarchical model`                                            | The HGF is a model that infers hidden states in the environment based on a hierarchy of beliefs and predictions. It is used to quantify belief updates at different levels of a hierarchy, from simple perceptions to complex beliefs about volatility.                                        | Used to understand how individuals with conditions like **schizophrenia** or **addiction** have altered belief updates about their environment, which can lead to false beliefs or compulsive behaviors. |
| **Predictive Coding**                        | `Bayesian inference`<br>`Generative models`                                             | This framework proposes that the brain continuously generates predictions about sensory input and only updates its internal models when a prediction error occurs.                                                                                                                             | Applied in neuroimaging studies to understand how the brain processes stimuli and how this process might be altered in conditions like **psychosis**.                                                    |
| **🎮 Models of Action Selection & Learning** |                                                                                         |                                                                                                                                                                                                                                                                                                |                                                                                                                                                                                                          |
| **Active Inference**                         | `Free-energy principle`<br>`Bayesian inference`<br>`Markov decision process (MDP)`      | This is a unified framework that suggests living systems, including the brain, minimize "free energy," which is a measure of surprise. This principle accounts for both perception and action, as actions are taken to reduce this surprise.                                                   | Used to model and explain a range of psychiatric symptoms, such as the **anhedonia in depression**, where an agent might choose not to engage in actions that could reduce surprise.                     |
| **Reinforcement Learning (RL)**              | `Q-learning`<br>`Temporal-difference learning`                                          | RL models describe how individuals learn to make decisions to maximize a cumulative reward. They are used to understand the computational basis of goal-directed behavior.                                                                                                                     | Used to model decision-making deficits in disorders like **substance use disorder**, where the reward system is thought to be dysregulated.                                                              |
| **Drift-Diffusion Model (DDM)**              | `Stochastic processes`<br>`Signal detection theory`                                     | The DDM is a model of two-alternative decision-making that explains both choice and response time. It assumes that evidence is accumulated over time until a threshold is reached, leading to a decision.                                                                                      | Applied to understand impulsive decision-making in disorders such as **ADHD** or **borderline personality disorder**, where individuals may have a lower decision threshold.                             |
| **🕸️ Models of Connectivity**                |                                                                                         |                                                                                                                                                                                                                                                                                                |                                                                                                                                                                                                          |
| **Dynamic Causal Modeling (DCM)**            | `Bayesian model comparison`<br>`General linear model (GLM)`<br>`Differential equations` | DCM is a framework for inferring the effective connectivity (directional influence) between brain regions from neuroimaging data. It models how neural activity in one region influences activity in another.                                                                                  | Used to investigate altered connectivity patterns in psychiatric disorders, such as a breakdown in the communication between the **prefrontal cortex and amygdala** in anxiety disorders.                |
| **Biophysical Models**                       | `Neural mass models`<br>`Neural field models`                                           | These models describe the dynamics of neuronal populations and are used to understand how macro-level brain activity (e.g., EEG rhythms) arises from micro-level neuronal interactions.                                                                                                        | Used to simulate and understand the generation of abnormal brain rhythms in conditions like **epilepsy** or **schizophrenia**.                                                                           |
| **🔬 Other Categories**                      |                                                                                         |                                                                                                                                                                                                                                                                                                |                                                                                                                                                                                                          |
| **Machine Learning**                         | `Supervised learning`<br>`Unsupervised learning`<br>`Normative modeling`                | Machine learning algorithms are used to find patterns and make predictions from large datasets. They can classify subjects, predict outcomes, or identify subgroups. Normative modeling is a specific application that creates a model of what is "typical" to identify individual deviations. | Used for **biomarker discovery**, such as identifying brain imaging patterns that can predict who will respond to a particular antidepressant.                                                           |
| **Models of Metacognition**                  | `Signal detection theory`<br>`Hierarchical models`                                      | These models quantify the ability of an individual to monitor and evaluate their own decisions and performance. They distinguish between performance accuracy and the subjective confidence in that performance.                                                                               | The **hMeta-d model** is used to investigate deficits in insight and self-awareness in conditions like **psychosis**, where individuals may have impaired metacognition.                                 |

</div>

---

If this sounds like your kind of problem, you'll be happy to know that a lot of this research is open-source. Many of these models are implemented in frameworks like **MATLAB** and **Python** (e.g., using libraries like **[cpm - computational psychiatry modeling library](https://cpm-toolbox.net/)**), so you can get your hands dirty with the code and data yourself.

The **[Translational Algorithms for Psychiatry-Advancing Science (TAPAS)](https://github.com/translationalneuromodeling/tapas)** toolbox is another great resource. While many of its core functions are in MATLAB and Python, its developers are also creating packages in **Julia** for things like Active Inference and the Hierarchical Gaussian Filter, making them more computationally efficient for large-scale research.

> This field is still in its early days, but the potential is enormous. Just as we use models to build more resilient software, computational psychiatry uses them to understand and, one day, hopefully, fix some of the most complex bugs in the human brain.

### Want to Prepare for a Course Like This?

If you're interested in diving deeper into computational psychiatry and want to prepare for courses like the CPC, check out the comprehensive [**Computational Psychiatry Course Preparation Resources**](https://github.com/computational-psychiatry-course/precourse-preparation). This repository provides curated MOOCs, reading materials, and tutorials covering everything from basic neuroscience and linear algebra to machine learning and programming—all the foundational knowledge you'll need to make the most of advanced computational psychiatry courses.

---

> _This post is a follow-up to my initial thoughts on the Computational Psychiatry Course: [Introduction to CPC Afterburn: A Software Engineer's Take on Computational Psychiatry](https://metaduck.com/cpc-computational-psychiatry-course-afterburn-intro/)._
