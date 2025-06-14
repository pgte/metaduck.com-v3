---
title: Why your application needs to be offline-first — typical use cases
description: "I recently attended the first Offline Camp, a gathering of a very diverse group of people that were interested and invested in the Offline-first subject."
date: 2016-07-20
author: "Pedro Teixeira"
tags: ["offline-first", "architecture", "mobile"]
---

![Offline Camp](../assets/blog/offline-camp.jpg)

I recently attended the first Offline Camp, a gathering of a very diverse group of people that were interested and invested in the Offline-first subject. Thanks to organisers (and to YLD, IBM Cloud Data Services, Meetup, Hoodie, Bocoup and Make&Model’s sponsorship), for three days we convened in this beautiful property on the Catskills Mountains, just a few hours north of New York City. The house rested on the top of a hill, surrounded by a lake and with a breath-taking view. This scenery prompted a relaxed environment that sparked many interesting conversations — between people and in a group — in a “unconference” format that lends itself to spontaneity.
Depending on the type of personalities involved, this type of gathering can sometimes be not very productive, but this was definitely NOT the case in this particular gathering. As commanded by the format, the subjects for discussion were proposed and voted, and interesting conversations sparked the imagination and verbosity of the attendees. At any given time there was always more than one subject being discussed in a different meeting rooms but, given that each group presented a detailed summary of what was discussed, I felt I didn’t miss a single bit.

## What is Offline-First

Offline-first is a way of approaching application development that is fundamentally different from the normal way you would approach it. Perhaps in a few years this will no longer be the case but, in general, applications that interact with some service that relies on internet connectivity will deliver a poor user experience when the connectivity is low or unavailable. Mobile networks are known to be flaky: having connectivity is far from guaranteed, which means that applications built this way are bound to deliver a degraded user experience.

If, instead, developers were to build an application whereby the internet connectivity is an enhancement, instead of a requirement, they would inherently set themselves to deliver an improved user experience. This is especially relevant in a world where mobile applications tend to increasingly be the main channel used to interact with any given service.

## Offline-first use cases

Coming from many different backgrounds, people shared their experiences and desires regarding applications that worked, or should have worked, in an offline environment. Here I have compiled a list of the most common sectors and industries where having applications that behave well while offline offers a significant advantage.

## Remote locations

A good part of this camp’s attendees worked for companies that had to deploy information systems operating in third-world countries, either inside of or sponsored by NGOs and governments, usually in regions that have little or no internet connectivity whatsoever. These are extreme conditions with many challenges and constraints, making them great test beds to learn from.

One of these types of applications is [HospitalRun](https://hospitalrun.io). HospitalRun is an open-source offline-first Hospital Management application that is to be deployed in third world countries, and it’s built using technologies like PouchDB, CouchDB, Node.js and Ember.js. Joel Worrall, the CTO of Cure.org (the organisation which started and guides the project) was present at this camp and, besides participating in the discussions, also gave a great passion talk presenting it.

Another example of a product that is operating in remote locations in third-world countries is SparkMeter. SparkMeter is a hardware product that measures the consumption of electricity and reports that into a central location. It relies on a sparse mesh network that communicates over electrical and radio networks. Besides making access to electricity possible in hard-to-reach places and underserved markets, this project is a great example of how offline-first is a requirement of most (if not all) IoT products.

![Porto Santo](../assets/blog/porto-santo.jpg)

## Location Services and Maps

With the particularity of mapping applications, the user of location services has a lot to gain from using a offline-first application. These applications are mostly used on the go, where sometimes mobile networks are particularly flaky or non-existent. For instance, if you’re traveling to a distant poorly populated location, there’s a good chance that you won’t have good or any internet connectivity at all.

Allowing degraded or even full capabilities while offline, in location services and maps in particular, is not an easy task. First there is the amount of data that you have to store locally: all the layers and their tiles are, most of the time, very space-comsuming. By using vector tiles instead of rasterised ones, with varying but limited degrees of detail, and caching them smartly can help solve this problem.

Then there’s the problem of geocoding. A geocoder is a service that translates addresses and names of places into world coordinates and is something more complex than it may look at first: besides the current user location and other options, its input is, typically, a full text search string that was either written or dictated. That one string has to be translated into a set of world coordinates, and for this you can use an inverted index for each of the levels (countries, states, cities, streets, etc). These indexes, if loaded in full, can take up a lot of space. You can improve this by downloading only the data the user anticipates he will need (before traveling, for instance), and compacting the index data in exchange for less precision (like, for instance, only storing ranges of door numbers).

Also, these rules rules have lots of strange cases depending on location. Increasingly, these rules and exceptions are not expressed as code, but computed by trained artificial intelligence, which is (still) hard to replicate into an offline environment.

My feeling is that, if you can solve some of the challenges of offline-first in map applications, you are probably solving a lot of similar problems for other applications.

> If you’re interested in the subject of offline maps, Julian Simioni has kindly put together a summary of what was discussed in the camp during some of the related sessions.

## On-line Retail

Beside being able to browse products while offline, the current checkout experience of most applications leaves much to be desired. We can make better use of offline-first technologies not only to make the checkout process more reliable, as they can make the application development much easier and with a higher quality.

Recently, Google has published a progressive web app that delivers a good offline experience. [Check it out here](https://shop.polymer-project.org/).

Making an offline-first retail application has some challenges like the total size of the product catalogue, as well as deciding which products should be accessible for offline access. If you choose a big set, the download time and data utilisation will rise. Here we need some heuristics to decide which data to make available offline, probably based on user history, preferences and some sort of collaborative filtering (predicting which products the customer are likely going to be searching for, based on the preferences of people with similar tastes).

![Porto Santo](../assets/blog/porto-santo-2.jpg)

## Social experiences

Another use of offline-first applications is one that offers a connecting experience to other humans by (anonymously and with their consent) tracking behaviour, location and other sensors. Depending on the type of application, this information does not need to be transmitted in real time. Instead it can be buffered and relayed when network conditions are better, or the device has access to a WiFi network.

Here, the challenges become less technological and more social, legal and ethical: how to build an app that respects human privacy rights and preferences, while offering a useful experience.

## Health

Offline-first technologies and solutions have many applications in the health sector.

Health Information Systems users (usually the health, laboratory and administrative personal) will benefit from applications that have offline-first capabilities. These systems are to be used in emergency situations and by personnel that doesn’t have much time on their hands. These professionals need to be able to access patient profiles quickly and reliably, and unavailability or lack of responsiveness is not well tolerated.

> Availability and fault tolerance is usually something that prevents or delays adoption of health information systems in emergency and critical care scenarios, even more than the concerns about the privacy.

An example of an offline-first health information system is, again, the open-source project HospitalRun. This is an system that allows true full functionality in offline environments, to be used in remote locations where internet or even private network access does not exist. Such systems allow the databases to sync once the network is available, even after weeks or months of local changes in multiple locations have gone by.

Even though availability is a key factor for choosing to adopt offline-first technologies, using them in health information systems imposes some challenges, some of them being data privacy and security. Since the replica of data is kept local in each node, there is the chance that data can be accessed directly, bypassing the application. This can be solved by keeping some of the data encrypted with a key derived from the user password, but this means that the sync process has to be intercepted to make sure no sensitive data is written unencrypted.

## Publishing

Offline-first has always been a goal of written media that are digitally distributed. Either by allowing you to download a PDF or publish into a “library” application, publishers always tried making the digital as convenient as the paper counterpart.
This has been typically delivered via mobile native applications, but recently, with the hype around progressive web apps, some publishers have stepped up their game. Recently, the Washington Post has published a demonstrative prototype application that uses offline-first solutions to deliver a good offline experience.

Here, the challenges are similar to some of those encountered in online retailing: given the whole catalogue of articles, which ones to make available offline? But since precision is not so adamant in these applications, having the most popular and/or most recent news is sometimes enough. If not, and since humans are less bound to use this application in a whim, personalisation is also something that can be used to specify which articles or categories to make available offline.

## Emerging markets

One obvious use of offline-first technologies is to endure mobile networks that are particularly flaky or barely present. Developing countries hold great promises — so many problems to be solved with so little resources — , but, in the early years 21st century, their connectivity story is not great most of the time.

If you want to develop a digital product for these environments, thinking offline-first from the first moment is not only an advantage, but also a requirement!

![Madeira](../assets/blog/madeira.jpg)

## Public Services

Public services are, most of the time, digitally delivered one way: some work hard to inform the citizens of laws, regulations and results. However, when enabling citizens to be individually serviced and starting to transfer their once totally-offline processes into online digital, public services should think about all the conditions in which these services are going to be used: on public transport, on the underground, in remote locations, while living and traveling abroad, and many more.

In order to provide a satisfying service without having to complicate application development to enable it, initiating these projects with an offline-first approach from the start should be a requirement.

## On-the-go services

Logistics, transports, delivery and mail are some of the sectors where some of the work force is mobile and often need to use applications independently of network conditions.

By using offline-first technologies that enable seamless data synchronisation, you can enable partial data syncs — loading only the sufficient data on the device before the worker leaves the office — , and, once he arrives back in the office, to sync it back into a central system. The application doesn’t even need to have mobile network access.

This way you can make sure that data is not lost and productivity is not sacrificed because of mobile network conditions.

## Mission-Critical Systems

High availability and low latency are usually two inherent properties of offline-first applications, which are thus better suited to be available than online-only systems.

This is why offline-first applications should be a requirement for fire-fighting, rescuing and all mission-critical applications where data should not be lost, should be quickly accessible and for all those applications where human time and service availability is paramount.

![Madeira](../assets/blog/madeira-2.jpg)

Offline-first technologies and techniques are a requirement or a significant improvement in several sectors and industries.
