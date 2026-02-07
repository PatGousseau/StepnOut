/**
 * Validates if an Instagram username corresponds to a valid public profile.
 * 
 * @param username The Instagram username to check.
 * @returns Promise<boolean> True if the profile exists, false otherwise.
 */
export const isUsernameValidProfile = async (username: string): Promise<boolean> => {
    const cleanUsername = username.replace(/[@\s]+/g, '');

    const response = await fetch(`https://www.instagram.com/${cleanUsername}/`);
    const text = await response.text();

    const titleMatch = text.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : "";
    const usernameLower = cleanUsername.toLowerCase();

    // Valid profiles usually have "Name (@username) • Instagram"
    // We check for the username in the title, handling html entities
    const isProfilePage = title.includes(`(@${usernameLower})`) || title.includes(`(&#064;${usernameLower})`);

    if (!isProfilePage) {
        console.log('Instagram title check failed:', title);
    }

    return isProfilePage;
};
