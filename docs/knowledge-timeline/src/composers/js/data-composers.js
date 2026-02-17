(function () {
  window.KT_DATA = window.KT_DATA || {};
  const composers = [
        {
          name: "C. Monteverdi",
          birth: 1567,
          death: 1643,
          works: [
            { title: "L'Orfeo", number: "SV 318", year: 1607, kind: "opera" },
            { title: "Vespro della Beata Vergine", number: "SV 206", year: 1610, kind: "choral" }
          ]
        },
        {
          name: "H. Schutz",
          birth: 1585,
          death: 1672,
          works: [
            { title: "Psalmen Davids", number: "SWV 22-47", year: 1619, kind: "choral" },
            { title: "Musikalische Exequien", number: "SWV 279-281", year: 1636, kind: "choral" }
          ]
        },
        {
          name: "J.-B. Lully",
          birth: 1632,
          death: 1687,
          works: [
            { title: "Atys", number: "1676", year: 1676, kind: "opera" },
            { title: "Te Deum", number: "LWV 55", year: 1677, kind: "choral" }
          ]
        },
        {
          name: "A. Corelli",
          birth: 1653,
          death: 1713,
          works: [
            { title: "12 Concerti Grossi", number: "Op.6", year: 1714, kind: "concerto" },
            { title: "Violin Sonatas", number: "Op.5", year: 1700, kind: "violin" }
          ]
        },
        {
          name: "J. Pachelbel",
          birth: 1653,
          death: 1706,
          works: [
            { title: "Canon and Gigue in D major", number: "P.37", year: 1680, kind: "orchestral" },
            { title: "Hexachordum Apollinis", number: "1699", year: 1699, kind: "keyboard" }
          ]
        },
        {
          name: "H. Purcell",
          birth: 1659,
          death: 1695,
          works: [
            { title: "Dido and Aeneas", number: "Z.626", year: 1689, kind: "opera" },
            { title: "Music for the Funeral of Queen Mary", number: "Z.860", year: 1695, kind: "choral" }
          ]
        },
        {
          name: "D. Buxtehude",
          birth: 1637,
          death: 1707,
          works: [
            { title: "Membra Jesu nostri", number: "BuxWV 75", year: 1680, kind: "choral" },
            { title: "Passacaglia in D minor", number: "BuxWV 161", year: 1690, kind: "keyboard" }
          ]
        },
        {
          name: "A. Vivaldi",
          birth: 1678,
          death: 1741,
          works: [
            { title: "The Four Seasons", number: "Op.8", year: 1725, kind: "concerto" },
            { title: "Gloria", number: "RV 589", year: 1715, kind: "choral" }
          ]
        },
        {
          name: "D. Scarlatti",
          birth: 1685,
          death: 1757,
          works: [
            { title: "Keyboard Sonatas", number: "K.1-555", year: 1738, kind: "keyboard" },
            { title: "Stabat Mater", number: "1739", year: 1739, kind: "choral" }
          ]
        },
        {
          name: "G.P. Telemann",
          birth: 1681,
          death: 1767,
          works: [
            { title: "Tafelmusik", number: "TWV 20", year: 1733, kind: "orchestral" },
            { title: "Paris Quartets", number: "TWV 43", year: 1730, kind: "quartet" }
          ]
        },
        {
          name: "J.S. Bach",
          birth: 1685,
          death: 1750,
          works: [
            { title: "Brandenburg Concertos", number: "BWV 1046-1051", year: 1721, kind: "concerto" },
            { title: "Mass in B minor", number: "BWV 232", year: 1749, kind: "choral" }
          ]
        },
        {
          name: "G.F. Handel",
          birth: 1685,
          death: 1759,
          works: [
            { title: "Water Music", number: "HWV 348-350", year: 1717, kind: "orchestral" },
            { title: "Messiah", number: "HWV 56", year: 1741, kind: "choral" }
          ]
        },
        {
          name: "F. Couperin",
          birth: 1668,
          death: 1733,
          works: [
            { title: "Pieces de clavecin", number: "1713", year: 1713, kind: "keyboard" },
            { title: "Lecons de tenebres", number: "1714", year: 1714, kind: "choral" }
          ]
        },
        {
          name: "J.-P. Rameau",
          birth: 1683,
          death: 1764,
          works: [
            { title: "Hippolyte et Aricie", number: "1733", year: 1733, kind: "opera" },
            { title: "Dardanus", number: "1739", year: 1739, kind: "opera" }
          ]
        },
        {
          name: "C.P.E. Bach",
          birth: 1714,
          death: 1788,
          works: [
            { title: "Magnificat", number: "Wq 215", year: 1749, kind: "choral" },
            { title: "Symphony in E minor", number: "Wq 178", year: 1756, kind: "symphony" }
          ]
        },
        {
          name: "L. Mozart",
          birth: 1719,
          death: 1787,
          works: [
            { title: "Toy Symphony", number: "1759", year: 1759, kind: "symphony" },
            { title: "Trumpet Concerto in D", number: "1762", year: 1762, kind: "concerto" }
          ]
        },
        {
          name: "C.W. Gluck",
          birth: 1714,
          death: 1787,
          works: [
            { title: "Orfeo ed Euridice", number: "1762", year: 1762, kind: "opera" },
            { title: "Alceste", number: "1767", year: 1767, kind: "opera" }
          ]
        },
        {
          name: "J. Haydn",
          birth: 1732,
          death: 1809,
          active: { start: 1760, end: 1808 },
          works: [
            { title: "Symphony No.94", number: "Hob.I:94", year: 1791, kind: "symphony" },
            { title: "The Creation", number: "Hob.XXI:2", year: 1798, kind: "choral" }
          ]
        },
        {
          name: "J.C. Bach",
          birth: 1735,
          death: 1782,
          works: [
            { title: "Symphony in G minor", number: "Op.6 No.6", year: 1766, kind: "symphony" },
            { title: "Amadis de Gaule", number: "1779", year: 1779, kind: "opera" }
          ]
        },
        {
          name: "L. Boccherini",
          birth: 1743,
          death: 1805,
          works: [
            { title: "String Quintet in E major", number: "G.275", year: 1771, kind: "chamber" },
            { title: "Cello Concerto in B-flat major", number: "G.482", year: 1772, kind: "concerto" }
          ]
        },
        {
          name: "A. Salieri",
          birth: 1750,
          death: 1825,
          works: [
            { title: "Les Danaides", number: "1784", year: 1784, kind: "opera" },
            { title: "Falstaff", number: "1799", year: 1799, kind: "opera" }
          ]
        },
        {
          name: "M. Clementi",
          birth: 1752,
          death: 1832,
          works: [
            { title: "Sonatina in C major", number: "Op.36 No.1", year: 1797, kind: "piano" },
            { title: "Gradus ad Parnassum", number: "Op.44", year: 1817, kind: "piano" }
          ]
        },
        {
          name: "W.A. Mozart",
          birth: 1756,
          death: 1791,
          works: [
            { title: "Symphony No.40", number: "K.550", year: 1788, kind: "symphony" },
            { title: "The Magic Flute", number: "K.620", year: 1791, kind: "opera" }
          ]
        },
        {
          name: "L. van Beethoven",
          birth: 1770,
          death: 1827,
          works: [
            { title: "Symphony No.5", number: "Op.67", year: 1808, kind: "symphony" },
            { title: "Symphony No.9", number: "Op.125", year: 1824, kind: "symphony" }
          ]
        },
        {
          name: "L. Cherubini",
          birth: 1760,
          death: 1842,
          works: [
            { title: "Medee", number: "1797", year: 1797, kind: "opera" },
            { title: "Requiem in C minor", number: "1816", year: 1816, kind: "choral" }
          ]
        },
        {
          name: "J.N. Hummel",
          birth: 1778,
          death: 1837,
          works: [
            { title: "Piano Concerto No.2", number: "Op.85", year: 1821, kind: "concerto" },
            { title: "Trumpet Concerto in E-flat", number: "S.49", year: 1803, kind: "concerto" }
          ]
        },
        {
          name: "N. Paganini",
          birth: 1782,
          death: 1840,
          works: [
            { title: "24 Caprices", number: "Op.1", year: 1817, kind: "violin" },
            { title: "Violin Concerto No.1", number: "Op.6", year: 1819, kind: "concerto" }
          ]
        },
        {
          name: "C.M. von Weber",
          birth: 1786,
          death: 1826,
          works: [
            { title: "Der Freischutz", number: "J.277", year: 1821, kind: "opera" },
            { title: "Invitation to the Dance", number: "Op.65", year: 1819, kind: "orchestral" }
          ]
        },
        {
          name: "G. Rossini",
          birth: 1792,
          death: 1868,
          works: [
            { title: "Il barbiere di Siviglia", number: "1816", year: 1816, kind: "opera" },
            { title: "Guillaume Tell", number: "1829", year: 1829, kind: "opera" }
          ]
        },
        {
          name: "V. Bellini",
          birth: 1801,
          death: 1835,
          works: [
            { title: "Norma", number: "1831", year: 1831, kind: "opera" },
            { title: "La sonnambula", number: "1831", year: 1831, kind: "opera" }
          ]
        },
        {
          name: "G. Donizetti",
          birth: 1797,
          death: 1848,
          works: [
            { title: "Lucia di Lammermoor", number: "1835", year: 1835, kind: "opera" },
            { title: "L'elisir d'amore", number: "1832", year: 1832, kind: "opera" }
          ]
        },
        {
          name: "F. Schubert",
          birth: 1797,
          death: 1828,
          works: [
            { title: "Symphony No.8", number: "D.759", year: 1822, kind: "symphony" },
            { title: "Winterreise", number: "D.911", year: 1827, kind: "song" }
          ]
        },
        {
          name: "F. Chopin",
          birth: 1810,
          death: 1849,
          works: [
            { title: "Nocturne", number: "Op.9 No.2", year: 1832, kind: "piano" },
            { title: "Ballade No.1", number: "Op.23", year: 1835, kind: "piano" }
          ]
        },
        {
          name: "R. Schumann",
          birth: 1810,
          death: 1856,
          works: [
            { title: "Carnaval", number: "Op.9", year: 1835, kind: "piano" },
            { title: "Symphony No.3 Rhenish", number: "Op.97", year: 1850, kind: "symphony" }
          ]
        },
        {
          name: "F. Mendelssohn",
          birth: 1809,
          death: 1847,
          works: [
            { title: "A Midsummer Night's Dream", number: "Op.61", year: 1842, kind: "orchestral" },
            { title: "Violin Concerto in E minor", number: "Op.64", year: 1844, kind: "concerto" }
          ]
        },
        {
          name: "M. Glinka",
          birth: 1804,
          death: 1857,
          works: [
            { title: "A Life for the Tsar", number: "1836", year: 1836, kind: "opera" },
            { title: "Ruslan and Lyudmila", number: "1842", year: 1842, kind: "opera" }
          ]
        },
        {
          name: "M. Balakirev",
          birth: 1837,
          death: 1910,
          works: [
            { title: "Islamey", number: "1869", year: 1869, kind: "piano" },
            { title: "Tamara", number: "1882", year: 1882, kind: "orchestral" }
          ]
        },
        {
          name: "C. Cui",
          birth: 1835,
          death: 1918,
          works: [
            { title: "Kaleidoscope", number: "Op.50", year: 1878, kind: "piano" },
            { title: "The Prisoner of the Caucasus", number: "1883", year: 1883, kind: "opera" }
          ]
        },
        {
          name: "M. Mussorgsky",
          birth: 1839,
          death: 1881,
          works: [
            { title: "Boris Godunov", number: "1874", year: 1874, kind: "opera" },
            { title: "Pictures at an Exhibition", number: "1874", year: 1874, kind: "piano" }
          ]
        },
        {
          name: "N. Rimsky-Korsakov",
          birth: 1844,
          death: 1908,
          works: [
            { title: "Scheherazade", number: "Op.35", year: 1888, kind: "orchestral" },
            { title: "The Golden Cockerel", number: "1909", year: 1909, kind: "opera" }
          ]
        },
        {
          name: "A. Glazunov",
          birth: 1865,
          death: 1936,
          works: [
            { title: "The Seasons", number: "Op.67", year: 1899, kind: "ballet" },
            { title: "Symphony No.5", number: "Op.55", year: 1895, kind: "symphony" }
          ]
        },
        {
          name: "A. Borodin",
          birth: 1833,
          death: 1887,
          works: [
            { title: "Prince Igor", number: "1890", year: 1890, kind: "opera" },
            { title: "Symphony No.2", number: "1876", year: 1876, kind: "symphony" }
          ]
        },
        {
          name: "H. Berlioz",
          birth: 1803,
          death: 1869,
          works: [
            { title: "Symphonie fantastique", number: "Op.14", year: 1830, kind: "symphony" },
            { title: "Harold en Italie", number: "Op.16", year: 1834, kind: "symphony" }
          ]
        },
        {
          name: "J. Strauss I",
          birth: 1804,
          death: 1849,
          works: [
            { title: "Radetzky March", number: "Op.228", year: 1848, kind: "orchestral" },
            { title: "Lorelei-Rhein-Klaenge", number: "Op.154", year: 1843, kind: "orchestral" }
          ]
        },
        {
          name: "J. Offenbach",
          birth: 1819,
          death: 1880,
          works: [
            { title: "Orphee aux enfers", number: "1858", year: 1858, kind: "opera" },
            { title: "Les Contes d'Hoffmann", number: "1881", year: 1881, kind: "opera" }
          ]
        },
        {
          name: "C. Schumann",
          birth: 1819,
          death: 1896,
          works: [
            { title: "Piano Concerto", number: "Op.7", year: 1835, kind: "concerto" },
            { title: "Piano Trio in G minor", number: "Op.17", year: 1846, kind: "chamber" }
          ]
        },
        {
          name: "F. Liszt",
          birth: 1811,
          death: 1886,
          works: [
            { title: "Hungarian Rhapsody No.2", number: "S.244/2", year: 1847, kind: "piano" },
            { title: "Faust Symphony", number: "S.108", year: 1857, kind: "symphony" }
          ]
        },
        {
          name: "A. Bruckner",
          birth: 1824,
          death: 1896,
          works: [
            { title: "Symphony No.7", number: "WAB 107", year: 1883, kind: "symphony" },
            { title: "Symphony No.8", number: "WAB 108", year: 1887, kind: "symphony" }
          ]
        },
        {
          name: "J. Strauss II",
          birth: 1825,
          death: 1899,
          works: [
            { title: "An der schoenen blauen Donau", number: "Op.314", year: 1867, kind: "orchestral" },
            { title: "Die Fledermaus", number: "1874", year: 1874, kind: "opera" }
          ]
        },
        {
          name: "J. Strauss (Josef)",
          birth: 1827,
          death: 1870,
          works: [
            { title: "Spharenklange", number: "Op.235", year: 1868, kind: "orchestral" },
            { title: "Delirien", number: "Op.212", year: 1867, kind: "orchestral" }
          ]
        },
        {
          name: "R. Wagner",
          birth: 1813,
          death: 1883,
          works: [
            { title: "Tristan und Isolde", number: "WWV 90", year: 1859, kind: "opera" },
            { title: "Der Ring des Nibelungen", number: "WWV 86", year: 1874, kind: "opera" }
          ]
        },
        {
          name: "G. Verdi",
          birth: 1813,
          death: 1901,
          works: [
            { title: "Rigoletto", number: "1851", year: 1851, kind: "opera" },
            { title: "Aida", number: "1871", year: 1871, kind: "opera" }
          ]
        },
        {
          name: "J. Brahms",
          birth: 1833,
          death: 1897,
          works: [
            { title: "Ein deutsches Requiem", number: "Op.45", year: 1868, kind: "choral" },
            { title: "Symphony No.1", number: "Op.68", year: 1876, kind: "symphony" }
          ]
        },
        {
          name: "C. Saint-Saens",
          birth: 1835,
          death: 1921,
          works: [
            { title: "Symphony No.3 Organ", number: "Op.78", year: 1886, kind: "symphony" },
            { title: "Samson et Dalila", number: "1877", year: 1877, kind: "opera" }
          ]
        },
        {
          name: "G. Bizet",
          birth: 1838,
          death: 1875,
          works: [
            { title: "Carmen", number: "1875", year: 1875, kind: "opera" },
            { title: "Les pecheurs de perles", number: "1863", year: 1863, kind: "opera" }
          ]
        },
        {
          name: "E. Grieg",
          birth: 1843,
          death: 1907,
          works: [
            { title: "Peer Gynt Suites", number: "Op.46/55", year: 1888, kind: "orchestral" },
            { title: "Piano Concerto in A minor", number: "Op.16", year: 1868, kind: "concerto" }
          ]
        },
        {
          name: "B. Smetana",
          birth: 1824,
          death: 1884,
          works: [
            { title: "Ma vlast", number: "1874", year: 1874, kind: "orchestral" },
            { title: "The Bartered Bride", number: "1866", year: 1866, kind: "opera" },
            { title: "The Moldau (Vltava)", number: "JB 1:112/2", year: 1874, kind: "orchestral" },
            { title: "String Quartet No.1 From My Life", number: "JB 1:105", year: 1876, kind: "quartet" },
            { title: "Dalibor", number: "1868", year: 1868, kind: "opera" }
          ]
        },
        {
          name: "P.I. Tchaikovsky",
          birth: 1840,
          death: 1893,
          works: [
            { title: "Swan Lake", number: "Op.20", year: 1876, kind: "ballet" },
            { title: "Symphony No.6", number: "Op.74", year: 1893, kind: "symphony" }
          ]
        },
        {
          name: "A. Dvorak",
          birth: 1841,
          death: 1904,
          works: [
            { title: "Symphony No.9 From the New World", number: "Op.95", year: 1893, kind: "symphony" },
            { title: "Cello Concerto", number: "Op.104", year: 1895, kind: "concerto" }
          ]
        },
        {
          name: "G. Faure",
          birth: 1845,
          death: 1924,
          works: [
            { title: "Requiem", number: "Op.48", year: 1888, kind: "choral" },
            { title: "Pavane", number: "Op.50", year: 1887, kind: "orchestral" }
          ]
        },
        {
          name: "E. Chausson",
          birth: 1855,
          death: 1899,
          works: [
            { title: "Poeme", number: "Op.25", year: 1896, kind: "violin" },
            { title: "Symphony in B-flat", number: "Op.20", year: 1890, kind: "symphony" }
          ]
        },
        {
          name: "E. Elgar",
          birth: 1857,
          death: 1934,
          works: [
            { title: "Enigma Variations", number: "Op.36", year: 1899, kind: "orchestral" },
            { title: "Cello Concerto", number: "Op.85", year: 1919, kind: "concerto" }
          ]
        },
        {
          name: "L. Janacek",
          birth: 1854,
          death: 1928,
          works: [
            { title: "Jenufa", number: "1904", year: 1904, kind: "opera" },
            { title: "Sinfonietta", number: "1926", year: 1926, kind: "symphony" }
          ]
        },
        {
          name: "R. Leoncavallo",
          birth: 1857,
          death: 1919,
          works: [
            { title: "Pagliacci", number: "1892", year: 1892, kind: "opera" },
            { title: "La Boheme", number: "1897", year: 1897, kind: "opera" }
          ]
        },
        {
          name: "P. Mascagni",
          birth: 1863,
          death: 1945,
          works: [
            { title: "Cavalleria rusticana", number: "1890", year: 1890, kind: "opera" },
            { title: "L'amico Fritz", number: "1891", year: 1891, kind: "opera" }
          ]
        },
        {
          name: "G. Mahler",
          birth: 1860,
          death: 1911,
          works: [
            { title: "Symphony No.2 Resurrection", number: "1894", year: 1894, kind: "symphony" },
            { title: "Symphony No.5", number: "1902", year: 1902, kind: "symphony" }
          ]
        },
        {
          name: "I. Albeniz",
          birth: 1860,
          death: 1909,
          works: [
            { title: "Iberia", number: "1905", year: 1905, kind: "piano" },
            { title: "Suite espanola", number: "Op.47", year: 1886, kind: "piano" }
          ]
        },
        {
          name: "C. Debussy",
          birth: 1862,
          death: 1918,
          works: [
            { title: "Prelude to the Afternoon of a Faun", number: "L.86", year: 1894, kind: "orchestral" },
            { title: "La Mer", number: "L.109", year: 1905, kind: "orchestral" }
          ]
        },
        {
          name: "R. Strauss",
          birth: 1864,
          death: 1949,
          works: [
            { title: "Also sprach Zarathustra", number: "Op.30", year: 1896, kind: "orchestral" },
            { title: "Der Rosenkavalier", number: "Op.59", year: 1911, kind: "opera" }
          ]
        },
        {
          name: "J. Sibelius",
          birth: 1865,
          death: 1957,
          works: [
            { title: "Finlandia", number: "Op.26", year: 1900, kind: "orchestral" },
            { title: "Symphony No.2", number: "Op.43", year: 1902, kind: "symphony" }
          ]
        },
        {
          name: "E. Satie",
          birth: 1866,
          death: 1925,
          works: [
            { title: "Gymnopedie No.1", number: "1888", year: 1888, kind: "piano" },
            { title: "Parade", number: "1917", year: 1917, kind: "ballet" }
          ]
        },
        {
          name: "S. Rachmaninoff",
          birth: 1873,
          death: 1943,
          works: [
            { title: "Piano Concerto No.2", number: "Op.18", year: 1901, kind: "concerto" },
            { title: "Symphony No.2", number: "Op.27", year: 1907, kind: "symphony" }
          ]
        },
        {
          name: "R. Vaughan Williams",
          birth: 1872,
          death: 1958,
          works: [
            { title: "The Lark Ascending", number: "1914", year: 1914, kind: "violin" },
            { title: "Fantasia on a Theme by Thomas Tallis", number: "1910", year: 1910, kind: "strings" }
          ]
        },
        {
          name: "C. Nielsen",
          birth: 1865,
          death: 1931,
          works: [
            { title: "Symphony No.4 The Inextinguishable", number: "Op.29", year: 1916, kind: "symphony" },
            { title: "Clarinet Concerto", number: "Op.57", year: 1928, kind: "concerto" }
          ]
        },
        {
          name: "J. Suk",
          birth: 1874,
          death: 1935,
          works: [
            { title: "Serenade for Strings", number: "Op.6", year: 1892, kind: "strings" },
            { title: "Asrael Symphony", number: "Op.27", year: 1906, kind: "symphony" }
          ]
        },
        {
          name: "G. Holst",
          birth: 1874,
          death: 1934,
          works: [
            { title: "The Planets", number: "Op.32", year: 1916, kind: "orchestral" },
            { title: "St Paul's Suite", number: "Op.29 No.2", year: 1913, kind: "strings" }
          ]
        },
        {
          name: "A. Scriabin",
          birth: 1872,
          death: 1915,
          works: [
            { title: "Poem of Ecstasy", number: "Op.54", year: 1908, kind: "orchestral" },
            { title: "Prometheus", number: "Op.60", year: 1910, kind: "orchestral" }
          ]
        },
        {
          name: "M. Ravel",
          birth: 1875,
          death: 1937,
          works: [
            { title: "Daphnis et Chloe", number: "M.57", year: 1912, kind: "ballet" },
            { title: "Bolero", number: "M.81", year: 1928, kind: "orchestral" }
          ]
        },
        {
          name: "O. Respighi",
          birth: 1879,
          death: 1936,
          works: [
            { title: "Roman Festivals", number: "P.157", year: 1928, kind: "orchestral" },
            { title: "Pines of Rome", number: "P.141", year: 1924, kind: "orchestral" }
          ]
        },
        {
          name: "M. de Falla",
          birth: 1876,
          death: 1946,
          works: [
            { title: "El amor brujo", number: "1915", year: 1915, kind: "ballet" },
            { title: "The Three-Cornered Hat", number: "1919", year: 1919, kind: "ballet" }
          ]
        },
        {
          name: "A. Casella",
          birth: 1883,
          death: 1947,
          works: [
            { title: "Scarlattiana", number: "Op.44", year: 1926, kind: "orchestral" },
            { title: "Paganiniana", number: "Op.65", year: 1942, kind: "orchestral" }
          ]
        },
        {
          name: "A. Ketelbey",
          birth: 1875,
          death: 1959,
          works: [
            { title: "In a Persian Market", number: "1920", year: 1920, kind: "orchestral" },
            { title: "In a Monastery Garden", number: "1915", year: 1915, kind: "orchestral" }
          ]
        },
        {
          name: "B. Bartok",
          birth: 1881,
          death: 1945,
          works: [
            { title: "Concerto for Orchestra", number: "Sz.116", year: 1943, kind: "orchestral" },
            { title: "Music for Strings, Percussion and Celesta", number: "Sz.106", year: 1936, kind: "orchestral" }
          ]
        },
        {
          name: "I. Stravinsky",
          birth: 1882,
          death: 1971,
          works: [
            { title: "The Firebird", number: "K010", year: 1910, kind: "ballet" },
            { title: "The Rite of Spring", number: "K015", year: 1913, kind: "ballet" }
          ]
        },
        {
          name: "H. Villa-Lobos",
          birth: 1887,
          death: 1959,
          works: [
            { title: "Bachianas brasileiras No.5", number: "1938", year: 1938, kind: "vocal" },
            { title: "Bachianas brasileiras No.2", number: "1930", year: 1930, kind: "orchestral" }
          ]
        },
        {
          name: "D. Milhaud",
          birth: 1892,
          death: 1974,
          works: [
            { title: "La creation du monde", number: "Op.81", year: 1923, kind: "ballet" },
            { title: "Saudades do Brasil", number: "Op.67", year: 1921, kind: "piano" }
          ]
        },
        {
          name: "F. Poulenc",
          birth: 1899,
          death: 1963,
          works: [
            { title: "Gloria", number: "FP 177", year: 1959, kind: "choral" },
            { title: "Dialogues des Carmelites", number: "FP 159", year: 1957, kind: "opera" }
          ]
        },
        {
          name: "J. Rodrigo",
          birth: 1901,
          death: 1999,
          works: [
            { title: "Concierto de Aranjuez", number: "1939", year: 1939, kind: "concerto" },
            { title: "Fantasia para un gentilhombre", number: "1954", year: 1954, kind: "concerto" }
          ]
        },
        {
          name: "S. Prokofiev",
          birth: 1891,
          death: 1953,
          works: [
            { title: "Romeo and Juliet", number: "Op.64", year: 1935, kind: "ballet" },
            { title: "Symphony No.5", number: "Op.100", year: 1944, kind: "symphony" }
          ]
        },
        {
          name: "G. Puccini",
          birth: 1858,
          death: 1924,
          works: [
            { title: "La Boheme", number: "1896", year: 1896, kind: "opera" },
            { title: "Madama Butterfly", number: "1904", year: 1904, kind: "opera" }
          ]
        },
        {
          name: "G. Gershwin",
          birth: 1898,
          death: 1937,
          works: [
            { title: "Rhapsody in Blue", number: "1924", year: 1924, kind: "orchestral" },
            { title: "An American in Paris", number: "1928", year: 1928, kind: "orchestral" }
          ]
        },
        {
          name: "A. Copland",
          birth: 1900,
          death: 1990,
          works: [
            { title: "Appalachian Spring", number: "1944", year: 1944, kind: "orchestral" },
            { title: "Fanfare for the Common Man", number: "1942", year: 1942, kind: "orchestral" }
          ]
        },
        {
          name: "A. Ginastera",
          birth: 1916,
          death: 1983,
          works: [
            { title: "Estancia", number: "Op.8", year: 1941, kind: "ballet" },
            { title: "Piano Concerto No.1", number: "Op.28", year: 1961, kind: "concerto" }
          ]
        },
        {
          name: "S. Barber",
          birth: 1910,
          death: 1981,
          works: [
            { title: "Adagio for Strings", number: "Op.11", year: 1938, kind: "strings" },
            { title: "Violin Concerto", number: "Op.14", year: 1939, kind: "concerto" }
          ]
        },
        {
          name: "W. Lutoslawski",
          birth: 1913,
          death: 1994,
          works: [
            { title: "Concerto for Orchestra", number: "1954", year: 1954, kind: "orchestral" },
            { title: "Symphony No.3", number: "1983", year: 1983, kind: "symphony" }
          ]
        },
        {
          name: "B. Britten",
          birth: 1913,
          death: 1976,
          works: [
            { title: "Peter Grimes", number: "Op.33", year: 1945, kind: "opera" },
            { title: "War Requiem", number: "Op.66", year: 1962, kind: "choral" }
          ]
        },
        {
          name: "D. Shostakovich",
          birth: 1906,
          death: 1975,
          works: [
            { title: "Symphony No.5", number: "Op.47", year: 1937, kind: "symphony" },
            { title: "Symphony No.10", number: "Op.93", year: 1953, kind: "symphony" }
          ]
        },
        {
          name: "A. Khachaturian",
          birth: 1903,
          death: 1978,
          works: [
            { title: "Gayane", number: "1942", year: 1942, kind: "ballet" },
            { title: "Spartacus", number: "1954", year: 1954, kind: "ballet" }
          ]
        },
        {
          name: "L. Bernstein",
          birth: 1918,
          death: 1990,
          works: [
            { title: "West Side Story", number: "1957", year: 1957, kind: "opera" },
            { title: "Candide Overture", number: "1956", year: 1956, kind: "orchestral" }
          ]
        },
        {
          name: "J. Williams",
          birth: 1932,
          death: 9999,
          works: [
            { title: "Jaws", number: "1975", year: 1975, kind: "orchestral" },
            { title: "Star Wars Main Title", number: "1977", year: 1977, kind: "orchestral" },
            { title: "Superman", number: "1978", year: 1978, kind: "orchestral" },
            { title: "Raiders of the Lost Ark", number: "1981", year: 1981, kind: "orchestral" },
            { title: "E.T. the Extra-Terrestrial", number: "1982", year: 1982, kind: "orchestral" },
            { title: "Jurassic Park", number: "1993", year: 1993, kind: "orchestral" },
            { title: "Schindler's List", number: "1993", year: 1993, kind: "orchestral" },
            { title: "Harry Potter and the Sorcerer's Stone", number: "2001", year: 2001, kind: "orchestral" }
          ]
        },
        {
          name: "J. Hisaishi",
          birth: 1950,
          death: 9999,
          works: [
            { title: "Nausicaa of the Valley of the Wind", number: "1984", year: 1984, kind: "orchestral" },
            { title: "Castle in the Sky", number: "1986", year: 1986, kind: "orchestral" },
            { title: "My Neighbor Totoro", number: "1988", year: 1988, kind: "orchestral" },
            { title: "Kiki's Delivery Service", number: "1989", year: 1989, kind: "orchestral" },
            { title: "Porco Rosso", number: "1992", year: 1992, kind: "orchestral" },
            { title: "Princess Mononoke", number: "1997", year: 1997, kind: "orchestral" },
            { title: "Spirited Away", number: "2001", year: 2001, kind: "orchestral" },
            { title: "Howl's Moving Castle", number: "2004", year: 2004, kind: "orchestral" },
            { title: "Ponyo", number: "2008", year: 2008, kind: "orchestral" },
            { title: "The Wind Rises", number: "2013", year: 2013, kind: "orchestral" },
            { title: "The Boy and the Heron", number: "2023", year: 2023, kind: "orchestral" }
          ]
        },
        {
          name: "K. Sugiyama",
          birth: 1931,
          death: 2021,
          works: [
            { title: "Dragon Quest Overture: Roto", number: "DQ I", year: 1986, kind: "orchestral" },
            { title: "Symphonic Suite Dragon Quest III", number: "DQ III", year: 1988, kind: "orchestral" },
            { title: "Symphonic Suite Dragon Quest V", number: "DQ V", year: 1992, kind: "orchestral" },
            { title: "Symphonic Suite Dragon Quest VIII", number: "DQ VIII", year: 2004, kind: "orchestral" },
            { title: "Symphonic Suite Dragon Quest XI", number: "DQ XI", year: 2017, kind: "orchestral" }
          ]
        },
        {
          name: "A. Piazzolla",
          birth: 1921,
          death: 1992,
          works: [
            { title: "Adios Nonino", number: "1959", year: 1959, kind: "other" },
            { title: "Libertango", number: "1974", year: 1974, kind: "other" }
          ]
        },
        {
          name: "G. Ligeti",
          birth: 1923,
          death: 2006,
          works: [
            { title: "Atmospheres", number: "1961", year: 1961, kind: "orchestral" },
            { title: "Lux Aeterna", number: "1966", year: 1966, kind: "choral" }
          ]
        },
        {
          name: "T. Takemitsu",
          birth: 1930,
          death: 1996,
          works: [
            { title: "November Steps", number: "1967", year: 1967, kind: "orchestral" },
            { title: "Requiem for Strings", number: "1957", year: 1957, kind: "strings" }
          ]
        },
        {
          name: "K. Penderecki",
          birth: 1933,
          death: 2020,
          works: [
            { title: "Threnody to the Victims of Hiroshima", number: "1960", year: 1960, kind: "orchestral" },
            { title: "Polish Requiem", number: "1984", year: 1984, kind: "choral" }
          ]
        }
  ];
  
  const extraWorks = {
        "C. Monteverdi": [
          { title: "L'incoronazione di Poppea", number: "SV 308", year: 1643, kind: "opera" }
        ],
        "J. Pachelbel": [
          { title: "Chaconne in F minor", number: "P.43", year: 1690, kind: "keyboard" }
        ],
        "A. Vivaldi": [
          { title: "Stabat Mater", number: "RV 621", year: 1712, kind: "choral" }
        ],
        "J.S. Bach": [
          { title: "St Matthew Passion", number: "BWV 244", year: 1727, kind: "choral" },
          { title: "The Art of Fugue", number: "BWV 1080", year: 1742, kind: "keyboard" }
        ],
        "G.F. Handel": [
          { title: "Music for the Royal Fireworks", number: "HWV 351", year: 1749, kind: "orchestral" }
        ],
        "J. Haydn": [
          { title: "Symphony No.45 Farewell", number: "Hob.I:45", year: 1772, kind: "symphony" },
          { title: "Symphony No.88", number: "Hob.I:88", year: 1787, kind: "symphony" },
          { title: "Symphony No.104", number: "Hob.I:104", year: 1795, kind: "symphony" }
        ],
        "W.A. Mozart": [
          { title: "Symphony No.25", number: "K.183", year: 1773, kind: "symphony" },
          { title: "Symphony No.29", number: "K.201", year: 1774, kind: "symphony" },
          { title: "Symphony No.31 Paris", number: "K.297", year: 1778, kind: "symphony" },
          { title: "Symphony No.35 Haffner", number: "K.385", year: 1782, kind: "symphony" },
          { title: "Symphony No.36 Linz", number: "K.425", year: 1783, kind: "symphony" },
          { title: "Symphony No.38 Prague", number: "K.504", year: 1786, kind: "symphony" },
          { title: "Symphony No.39", number: "K.543", year: 1788, kind: "symphony" },
          { title: "Symphony No.41 Jupiter", number: "K.551", year: 1788, kind: "symphony" },
          { title: "Requiem", number: "K.626", year: 1791, kind: "choral" },
          { title: "Don Giovanni", number: "K.527", year: 1787, kind: "opera" }
        ],
        "L. van Beethoven": [
          { title: "Symphony No.6 Pastoral", number: "Op.68", year: 1808, kind: "symphony" },
          { title: "Symphony No.7", number: "Op.92", year: 1812, kind: "symphony" },
          { title: "Symphony No.3 Eroica", number: "Op.55", year: 1804, kind: "symphony" },
          { title: "Missa solemnis", number: "Op.123", year: 1823, kind: "choral" }
        ],
        "N. Paganini": [
          { title: "La Campanella", number: "Op.7 No.2", year: 1826, kind: "violin" }
        ],
        "F. Schubert": [
          { title: "Symphony No.9", number: "D.944", year: 1825, kind: "symphony" },
          { title: "String Quintet in C", number: "D.956", year: 1828, kind: "strings" }
        ],
        "F. Chopin": [
          { title: "Piano Concerto No.1", number: "Op.11", year: 1830, kind: "concerto" }
        ],
        "R. Schumann": [
          { title: "Piano Concerto", number: "Op.54", year: 1845, kind: "concerto" },
          { title: "Symphony No.4", number: "Op.120", year: 1851, kind: "symphony" }
        ],
        "H. Berlioz": [
          { title: "La Damnation de Faust", number: "Op.24", year: 1846, kind: "orchestral" },
          { title: "Roméo et Juliette", number: "Op.17", year: 1839, kind: "orchestral" }
        ],
        "F. Mendelssohn": [
          { title: "Symphony No.3 Scottish", number: "Op.56", year: 1842, kind: "symphony" },
          { title: "Symphony No.4 Italian", number: "Op.90", year: 1833, kind: "symphony" }
        ],
        "G. Donizetti": [
          { title: "Don Pasquale", number: "1843", year: 1843, kind: "opera" },
          { title: "Anna Bolena", number: "1830", year: 1830, kind: "opera" }
        ],
        "J. Strauss I": [
          { title: "Paris Waltz", number: "Op.101", year: 1838, kind: "orchestral" }
        ],
        "F. Liszt": [
          { title: "Les Preludes", number: "S.97", year: 1854, kind: "orchestral" }
        ],
        "R. Wagner": [
          { title: "Parsifal", number: "WWV 111", year: 1882, kind: "opera" }
        ],
        "G. Verdi": [
          { title: "La Traviata", number: "1853", year: 1853, kind: "opera" }
        ],
        "A. Bruckner": [
          { title: "Symphony No.4", number: "WAB 104", year: 1874, kind: "symphony" },
          { title: "Symphony No.9", number: "WAB 109", year: 1896, kind: "symphony" }
        ],
        "J. Strauss II": [
          { title: "Kaiser-Walzer", number: "Op.437", year: 1889, kind: "orchestral" }
        ],
        "J. Strauss (Josef)": [
          { title: "Dorfschwalben aus Osterreich", number: "Op.164", year: 1864, kind: "orchestral" }
        ],
        "J. Brahms": [
          { title: "Violin Concerto", number: "Op.77", year: 1878, kind: "concerto" },
          { title: "Symphony No.4", number: "Op.98", year: 1885, kind: "symphony" }
        ],
        "P.I. Tchaikovsky": [
          { title: "Symphony No.4", number: "Op.36", year: 1878, kind: "symphony" },
          { title: "The Nutcracker", number: "Op.71", year: 1892, kind: "ballet" }
        ],
        "A. Dvorak": [
          { title: "Slavonic Dances", number: "Op.46", year: 1878, kind: "orchestral" },
          { title: "Symphony No.7", number: "Op.70", year: 1885, kind: "symphony" },
          { title: "Symphony No.8", number: "Op.88", year: 1889, kind: "symphony" },
          { title: "String Quartet No.12 American", number: "Op.96", year: 1893, kind: "strings" }
        ],
        "G. Mahler": [
          { title: "Symphony No.3", number: "1896", year: 1896, kind: "symphony" },
          { title: "Symphony No.6", number: "1904", year: 1904, kind: "symphony" },
          { title: "Das Lied von der Erde", number: "1909", year: 1909, kind: "song" }
        ],
        "C. Debussy": [
          { title: "Pelleas et Melisande", number: "L.88", year: 1902, kind: "opera" }
        ],
        "R. Strauss": [
          { title: "Ein Heldenleben", number: "Op.40", year: 1898, kind: "orchestral" }
        ],
        "J. Sibelius": [
          { title: "Symphony No.1", number: "Op.39", year: 1899, kind: "symphony" },
          { title: "Symphony No.5", number: "Op.82", year: 1915, kind: "symphony" },
          { title: "Violin Concerto", number: "Op.47", year: 1904, kind: "concerto" }
        ],
        "C. Nielsen": [
          { title: "Symphony No.3 Sinfonia Espansiva", number: "Op.27", year: 1911, kind: "symphony" },
          { title: "Symphony No.5", number: "Op.50", year: 1922, kind: "symphony" }
        ],
        "J. Suk": [
          { title: "A Summer's Tale", number: "Op.29", year: 1909, kind: "orchestral" }
        ],
        "M. Ravel": [
          { title: "Piano Concerto in G", number: "M.83", year: 1931, kind: "concerto" }
        ],
        "B. Bartok": [
          { title: "Mikrokosmos", number: "Sz.107", year: 1939, kind: "piano" }
        ],
        "I. Stravinsky": [
          { title: "Petrushka", number: "K012", year: 1911, kind: "ballet" }
        ],
        "S. Prokofiev": [
          { title: "Peter and the Wolf", number: "Op.67", year: 1936, kind: "orchestral" },
          { title: "Symphony No.1 Classical", number: "Op.25", year: 1917, kind: "symphony" },
          { title: "Symphony No.7", number: "Op.131", year: 1952, kind: "symphony" }
        ],
        "D. Shostakovich": [
          { title: "Symphony No.7 Leningrad", number: "Op.60", year: 1941, kind: "symphony" },
          { title: "Symphony No.8", number: "Op.65", year: 1943, kind: "symphony" },
          { title: "String Quartet No.8", number: "Op.110", year: 1960, kind: "strings" }
        ]
  };
  window.KT_DATA.composers = composers;
  window.KT_DATA.extraWorks = extraWorks;
})();
