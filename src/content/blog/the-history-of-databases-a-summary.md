---
title: "The History of Databases - A Summary"
description: "A comprehensive overview of the evolution of databases from their early beginnings to modern times."
date: 2019-11-26
author: "Pedro Teixeira"
tags: ["databases", "history", "technology"]
---

## Databases

The appearance of the term "database" coincided with the availability of [direct-access storage](https://en.wikipedia.org/wiki/Direct-access_storage_device) (mid-60's). The term represented a contrast with the tape-based systems of the past, allowing **shared interactive use** rather than batch processing.

## Network databases

General-purpose database systems emerged during that time.

- [CODASYL](https://en.wikipedia.org/wiki/CODASYL): primary key, navigation relationships, or scanning.
- [IBM IMS (Information Management System)](https://en.wikipedia.org/wiki/IBM_Information_Management_System), running on the [System/360](https://en.wikipedia.org/wiki/IBM_System/360), initially developed for [the Apollo program](https://en.wikipedia.org/wiki/Apollo_program). _Strictly hierarchical_.

Both IMS and CODASYL classify as **network databases**.

## 1970's relational databases

[Edgar Codd](https://en.wikipedia.org/wiki/Edgar_F._Codd), at the time working for IBM on storage, became frustrated by the limitations imposed by network databases.

Initial idea: tables of fixed-length records. Different table for different types of identity.

The **relational** part comes from the capability of entities referring to other entities.

A relational database can express both hierarchical or navigational models, as well as its native tabular model.

To query it, the author of the relational algebra proposed a set-oriented language, which would later spawn **SQL**.

Based on Codd's paper, [INGRES](<https://en.wikipedia.org/wiki/Ingres_(database)>) was created by two people at Berkeley ([Eugene Wong](https://en.wikipedia.org/wiki/Eugene_Wong) and [Michael Stonebraker](https://en.wikipedia.org/wiki/Michael_Stonebraker)).

## Late 1970's: SQL DBMSs

IBM started working on an implementation of Codd's paper named [System R](https://en.wikipedia.org/wiki/IBM_System_R), first single-table and then later, in the late 70's, on a multi-table implementation.

Later, multi-user versions were developed and were tested by customers in 1978 and 1979, by which time a standardized language named **SQL** had been added.

The success of these experiments led IBM to create a true production of System R known as **SQL/DS** and later, **Database 2** ([DB2](https://en.wikipedia.org/wiki/IBM_Db2_Family)).

By around the same time, [Larry Ellison](https://en.wikipedia.org/wiki/Larry_Ellison) developed the [Oracle database](https://en.wikipedia.org/wiki/Oracle_Database), based off IBM's papers on System R, and released Oracle version 2 in 1979.

Stonebraker took his learnings from INGRES and started a project named **Postgres** (now known as [PostgreSQL](https://en.wikipedia.org/wiki/PostgreSQL)), since then used in many mission-critical applications.

## 1980's on the desktop

Spreadsheet software (like [Lotus 123](https://en.wikipedia.org/wiki/Lotus_1-2-3)) and database software (like [dBASE](https://en.wikipedia.org/wiki/DBase)) appeared for desktop computers. **dBASE** became a huge success during the 80's and 90's.

## Document databases

Document databases emerged to meet the needs of applications requiring **flexible schemas** and **fast iteration cycles**—typical of modern web and mobile development. Instead of rigid tables and rows, data is stored as JSON or BSON documents, which can easily evolve without requiring migrations.

By avoiding join operations and relying on nested data structures, these databases can provide performance benefits for read-heavy workloads. Popular document stores include [MongoDB](https://en.wikipedia.org/wiki/MongoDB), [CouchDB](https://en.wikipedia.org/wiki/CouchDB), and **Amazon DocumentDB**. Their design also makes them well-suited to horizontal scaling, often via sharding.

## Now

In recent years, the explosive growth of data and the ubiquity of cloud computing have driven demand for **massively distributed databases** with high availability and fault tolerance. However, the [CAP theorem](https://en.wikipedia.org/wiki/CAP_theorem) highlights a fundamental tradeoff: in the presence of a network partition, a distributed system can guarantee either **consistency** or **availability**, but not both.

As a result, many modern systems favor **eventual consistency**—a model in which all updates will propagate through the system over time, and all replicas will eventually become consistent, assuming no new updates are made. This approach allows systems to remain available even when parts of the network are unreachable.

Examples of distributed databases embracing this model include:

- **[Cassandra](https://en.wikipedia.org/wiki/Apache_Cassandra)** – known for high write throughput and tunable consistency.
- **[Amazon DynamoDB](https://en.wikipedia.org/wiki/Amazon_DynamoDB)** – inspired by the Dynamo system described in Amazon's influential whitepaper.
- **[Riak](https://en.wikipedia.org/wiki/Riak)** – designed for fault tolerance and ease of scaling.

## The future

The landscape of databases continues to evolve. Trends shaping the future include:

- **NewSQL**: efforts to combine the consistency and usability of traditional SQL systems with the scalability of NoSQL. Examples include [CockroachDB](https://en.wikipedia.org/wiki/CockroachDB), [Google Spanner](<https://en.wikipedia.org/wiki/Spanner_(database)>), and [TiDB](https://en.wikipedia.org/wiki/TiDB).
- **Multi-model databases**: databases like [ArangoDB](https://en.wikipedia.org/wiki/ArangoDB) and [OrientDB](https://en.wikipedia.org/wiki/OrientDB) that support documents, graphs, key-value pairs, and relational data, all in one system.
- **Cloud-native and serverless databases**: platforms like [Firebase](https://en.wikipedia.org/wiki/Firebase), [Fauna](https://fauna.com/), and [PlanetScale](https://planetscale.com/) are offering fully managed, globally distributed databases tailored for modern development workflows.
- **AI and vector databases**: the rise of AI and large language models has driven demand for databases that support high-dimensional vector storage and similarity search, such as [Pinecone](https://www.pinecone.io/), [Weaviate](https://weaviate.io/), and [FAISS](https://github.com/facebookresearch/faiss).

## Conclusion

From batch-processed tapes to globally distributed, AI-powered systems, databases have undergone **radical transformations**—always driven by the needs of applications and the capabilities of the underlying hardware. While no single model fits all use cases, the diversity of database systems today reflects the richness of modern computing and the continuing push for performance, flexibility, and scale.

As data continues to grow in size and importance, the evolution of databases remains one of the most **critical stories** in the history of computing.
