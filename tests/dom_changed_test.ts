import { GLOBALS } from '../main.ts';
import { Cinema } from '../models/cinema.ts';
import CinemaParser from '../utils/cinema_parser.ts';
import { HtmlParser } from '../utils/html_parser.ts';
import WebLoader from '../utils/web_loader.ts';
import { expect } from 'jsr:@std/expect';
import { Element } from 'jsr:@b-fuze/deno-dom';

interface CinemaMovieTestData {
	cinema: Cinema;
	movieList: Element | null;
}

Deno.test({
	name: 'Check if DOM is unchanged',
	async fn() {
		const cinemaPromises = GLOBALS.subPaths.map(
			async (subPath: string) => {
				const url = GLOBALS.baseUrl + subPath;
				const rawDocument = await WebLoader.load(url);
				const document = HtmlParser.getDocument(rawDocument);
				return {
					cinema: CinemaParser.parseCinema(document, url),
					movieList: document.querySelector(
						'body > main > div > div > div > ul',
					),
				} satisfies CinemaMovieTestData;
			},
		);

		await Promise.all(cinemaPromises).then(
			(testData: CinemaMovieTestData[]) => {
				// Verify we receive always GLOBALS.subPaths.length cinemas
				expect(testData.length).toBe(GLOBALS.subPaths.length);

				testData.forEach((data) => {
					// Verify the movieList <ul> was found and contains any amount of movies
					expect(data.movieList).not.toBe(null);
					expect(data.movieList?.children.length).toBeGreaterThan(0);
				});
			},
		);
	},
	sanitizeResources: false,
	sanitizeOps: false,
});
