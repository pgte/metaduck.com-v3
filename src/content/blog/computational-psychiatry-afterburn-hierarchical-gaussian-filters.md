---
title: "Diving Deeper: Perception, Beliefs, and the Hierarchical Gaussian Filter"
description: "A practical introduction to the Hierarchical Gaussian Filter (HGF) in computational psychiatry—how it models human perception, belief updating, and learning under uncertainty, with intuitive explanations for software engineers."
author: "Pedro Teixeira"
date: 2025-09-18
tags: ["Computational Psychiatry", "AI & ML"]
image: "/images/blog/astronaut-brain-computer.jpg"
---

![Astronaut and brain](/images/blog/astronaut-brain-computer.jpg)

Of course. Here is the revised article with all the corrections applied.

Hey everyone\! Welcome back. In the last article, we took a bird's-eye view of computational psychiatry, touching on models of perception, action, and learning. Now, it's time to zoom in. As promised, we're starting with perception, and our first stop is a really cool Bayesian model called the **Hierarchical Gaussian Filter (HGF)**.

For us software engineers, you can think of the HGF as a real-time system for updating beliefs. Imagine you're building a spam filter. You have a model of what "spam" looks like, and with each new email, you update your model. The HGF does something similar, but it's designed to model how _we_ as humans update our beliefs about the world, especially in environments that are constantly changing.

---

## The Gist of HGF: It's All About Uncertainty

At its core, the HGF is a model of learning under uncertainty. As we navigate the world, we're constantly making predictions. When those predictions are wrong, we experience a **prediction error** (PE), which is just the difference between what we expected and what we got. The HGF proposes that we use these PEs to update our beliefs.

But here's the clever part: the HGF says that the _size_ of the update depends on our **uncertainty**. If we're very certain about a belief, a single PE won't change our minds much. But if we're uncertain, we'll be more swayed by new evidence.

This is where the "hierarchical" part comes in. The HGF models beliefs at multiple levels. The lowest level might be a belief about a specific stimulus (e.g., "is this email spam?"). The next level up would be a belief about the _volatility_ of the environment (e.g., "how likely is it that the spammer will change their tactics?"). And you can keep adding levels, each one representing a more abstract and stable belief about the world.

This hierarchical structure allows the HGF to do something really neat: it can adjust its own learning rate. If the environment is stable, the learning rate will be low. But if the environment becomes volatile, the learning rate will increase, allowing the model to adapt more quickly to new information.

---

## The Math Behind the Magic 🧙

Okay, let's pop the hood and look at the math. Don't worry, we'll keep it conceptual.

The HGF assumes that our beliefs about the world can be represented by **Gaussian probability distributions**. A Gaussian distribution is just a fancy name for the bell curve, and it's defined by two parameters: the **mean** ($\\mu$), which represents our belief, and the **variance** ($\\sigma^2$), which represents our uncertainty about that belief.

The model consists of a series of levels, where the state at level $i$ is denoted by $x\_i$. The lowest level, $x\_1$, represents the quantity we're trying to predict. The levels above, $x\_2$, $x\_3$, etc., represent the volatility of the level below.

The update equations for the HGF are derived using **variational Bayes**, which is a way of approximating the true posterior distribution of our beliefs. The key equations look something like this:

- **Prediction at level i:**
  $$\hat{\mu}_i^{(k)} = \mu_i^{(k-1)}$$

- **Prediction error at level i:**
  $$\delta_i^{(k)} = x_i^{(k)} - \hat{\mu}_i^{(k)}$$

- **Update of the mean at level i:**
  $$\mu_i^{(k)} = \hat{\mu}_i^{(k)} + \alpha_i \cdot \delta_i^{(k)}$$

Here, $k$ is the trial number, $\\hat{\\mu}\_i^{(k)}$ is the prediction at level $i$ on trial $k$, and $\\delta\_i^{(k)}$ is the prediction error. The learning rate, $\\alpha\_i$, is proportional to the precision (the inverse of the variance) of the belief at the level above.

This is the key takeaway:

> **$\\alpha\_i$ isn't a fixed learning rate you have to tune.** It's calculated on the fly, based on the model's own uncertainty at the next level up. That's what allows the HGF to dynamically adjust how much it learns.

---

## How's It Used? From Schizophrenia to Addiction

So, what can we do with this fancy model? Well, the HGF has been used to study a wide range of cognitive processes and psychiatric conditions. Here are a few examples:

- **Schizophrenia:** Some researchers have used the HGF to model the perceptual disturbances that are common in schizophrenia, such as hallucinations and delusions. The idea is that these experiences might be caused by an inability to properly weigh prediction errors, leading to a distorted model of the world.
- **Anxiety:** The HGF can be used to model how we learn about threats in our environment. This can help us understand how anxiety disorders develop and how they might be treated.
- **Addiction:** The HGF has been used to model the decision-making processes that are involved in addiction. For example, it can help us understand why some people are more likely to relapse after a period of abstinence.

The beauty of the HGF is that it provides a formal, mathematical framework for thinking about these complex issues. It allows us to move beyond simply describing symptoms and start to understand the underlying computational mechanisms.

---

## Let's Get Our Hands Dirty: A Code Sample

Of course, no article for software engineers would be complete without some code\! There are a few different implementations of the HGF out there, but one of the most popular is the `pyhgf` library for Python.

Here's a quick example of how you might use `pyhgf` to simulate a simple learning experiment:

```python
from pyhgf.model import HGF
from pyhgf import load_data

# Load some example data
timeseries = load_data("binary")

# Define our HGF model
hgf = HGF(
    n_levels=2,
    model_type="binary",
    initial_mu={"1": .0, "2": .5},
    initial_pi={"1": .0, "2": 1e4},
    omega={"2": -3.0},
)

# Feed the data to the model
hgf.input_data(input_data=timeseries)

# Compute the model's surprise (-log probability)
surprise = hgf.surprise()
print(f"Model's surprise = {surprise}")

# Plot the belief trajectories
hgf.plot_trajectories()
```

This is just a taste of what you can do with `pyhgf`. The library is well-documented and has a bunch of examples to get you started. I encourage you to check it out and play around with it\!

---

## Wrapping Up

So there you have it: a whirlwind tour of the Hierarchical Gaussian Filter. We've seen how it can be used to model learning and belief updating, we've peeked at the math that makes it all work, and we've even written a bit of code.

I hope this has given you a sense of why the HGF is such a powerful tool in computational psychiatry. In the next article, we'll continue our journey into the world of perception, exploring other models and seeing how they can be used to understand the complexities of the human mind.

Stay tuned\!

---

## Want to Go Deeper? Resources for Further Study

If this sparked your curiosity and you're ready to dive headfirst into the HGF rabbit hole, here are some excellent resources to get you started. They range from the foundational academic papers to hands-on coding toolboxes.

### Foundational Papers

1.  **A Bayesian foundation for individual learning under uncertainty (2011)** by Mathys, C., Daunizeau, J., Friston, K. J., & Stephan, K. E.

    - **Link:** [Frontiers in Human Neuroscience](https://www.frontiersin.org/articles/10.3389/fnhum.2011.00039/full)
    - **Why read it?** This is one of the seminal papers that lays out the full mathematical theory of the HGF. It's dense, but it's the definitive source.

2.  **Uncertainty in perception and the Hierarchical Gaussian Filter (2014)** by Mathys, C., Lomakina, E. I., & Daunizeau, J.

    - **Link:** [Frontiers in Human Neuroscience](https://www.frontiersin.org/articles/10.3389/fnhum.2014.00825/full)
    - **Why read it?** A key follow-up paper that provides a more accessible overview and further details on the model's application to perception.

---

### Toolboxes & Code

1.  **TAPAS (Translational Algorithms for Psychiatry-Advancing Science)**

    - **Link:** [Translational Neuromodeling Unit (TNU) Website](https://www.tnu.ethz.ch/de/software/tapas)
    - **What is it?** This is the original, open-source MATLAB toolbox for implementing the HGF and other computational models. It's the gold standard in the research community and is incredibly well-documented.

2.  **PyHGF**

    - **Link:** [PyHGF GitHub Repository](https://github.com/ComputationalPsychiatry/pyhgf)
    - **What is it?** The Python implementation of the HGF we used in the code sample. It's a great choice if you're more comfortable in the Python ecosystem. The documentation is excellent and provides a solid starting point for simulations.

3.  **hBayesDM (Hierarchical Bayesian Modeling of Decision-Making Tasks)**

    - **Link:** [hBayesDM Website](https://ccs-lab.github.io/hBayesDM/)
    - **What is it?** An R package that makes it easy to fit a wide range of computational models, including the HGF, to behavioral data. It's built on top of Stan, a powerful probabilistic programming language.

---

Happy coding, and happy learning\!
