I listed 3 api queries that don't need any authentication. but gives us the solid idea as our codebase gets us the AI predicted seeds in a schema but they aren't validated yet if they are available in farcaster or not. So I want you to help me validate the seeds and return the valid seeds once user does the confirm button in preview section of those rough seeds where you will be utilising each seed words listed there to query with these api queries. Then we pass all the api response back to the gemini api using gemini-2.5-flash to help us get the right seeds that were validated using the API response so that we can get the refined seeds and making rough schema to a final refined schema of seed that to be displayed after user confirms the rough seeds.

Also, for farcaster usernames, current AI is making a rough schema with .eth but that might not be always on each usernames so keep only name without the domain like .eth or .farcaster or .base.eth in our system prompt change some rules for this. If there were any such domains these listed APIs will validate and passing them to AI will let it realize the correct username seed values automatically.

1. https://client.farcaster.xyz/v2/search-channels?q=dwr&prioritizeFollowed=false&forComposer=false&limit=2

Response: {
    "result": {
        "channels": [
            {
                "type": "channel",
                "key": "dwr",
                "name": "dwr",
                "showCastSourceLabels": true,
                "showCastTags": false,
                "sectionRank": 50,
                "subscribable": true,
                "viewerContext": {
                    "following": false,
                    "isMember": false,
                    "hasUnseenItems": false,
                    "favoritePosition": -1,
                    "canCast": false
                },
                "imageUrl": "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/93a8f8e5-18f2-4a23-1add-aff855b0ff00/original",
                "headerAction": {
                    "title": "ascend",
                    "target": "https://youtu.be/uLeAot4Zrxo?si=6MtEkFwZ4QHQZrTP"
                },
                "headerActionMetadata": {
                    "url": "https://youtu.be/uLeAot4Zrxo?si=6MtEkFwZ4QHQZrTP",
                    "sourceUrl": "https://youtu.be/uLeAot4Zrxo?si=6MtEkFwZ4QHQZrTP",
                    "title": "Kirin J. Callinan's - Screaming cowboy",
                    "domain": "youtu.be",
                    "image": "https://i.ytimg.com/vi/uLeAot4Zrxo/sddefault.jpg",
                    "useLargeImage": true
                },
                "fastImageUrl": "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/93a8f8e5-18f2-4a23-1add-aff855b0ff00/original",
                "feeds": [
                    {
                        "name": "Main",
                        "type": "default"
                    }
                ],
                "description": "undercooked thoughts and musings",
                "followerCount": 479,
                "memberCount": 1,
                "publicCasting": false,
                "castingMode": "members-only"
            },
            {
                "type": "channel",
                "key": "lolsorrydwr",
                "name": "lolsorry",
                "showCastSourceLabels": true,
                "showCastTags": false,
                "sectionRank": 50,
                "subscribable": true,
                "viewerContext": {
                    "following": true,
                    "isMember": false,
                    "hasUnseenItems": false,
                    "favoritePosition": -1,
                    "canCast": true
                },
                "imageUrl": "https://i.imgur.com/cSPw1c0.png",
                "fastImageUrl": "https://i.imgur.com/cSPw1c0.png",
                "feeds": [
                    {
                        "name": "Main",
                        "type": "default"
                    }
                ],
                "description": "the ticker is out there, but liquidity is gone. 🎩🎩🎩 \n21,000,000 max capped supply just like god intended\n15% of supply airdropped to @dwr.eth \n70% to community for apologizing",
                "followerCount": 733,
                "memberCount": 5,
                "publicCasting": true,
                "castingMode": "recommended"
            }
        ]
    },
    "next": {
        "cursor": "eyJsaW1pdCI6MiwicGFnZSI6MX0"
    }
}

2. https://client.farcaster.xyz/v2/search-users?q=dwr&excludeSelf=false&limit=2&includeDirectCastAbility=false

Response: {
    "result": {
        "users": [
            {
                "fid": 3,
                "displayName": "Dan Romero",
                "profile": {
                    "bio": {
                        "text": "Working on Farcaster",
                        "mentions": [],
                        "channelMentions": []
                    },
                    "location": {
                        "placeId": "ChIJE9on3F3HwoAR9AhGJW_fL-I",
                        "description": "Los Angeles, CA, USA"
                    },
                    "earlyWalletAdopter": true,
                    "accountLevel": "pro",
                    "url": "https://danromero.org",
                    "bannerImageUrl": "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/dab99f37-561b-4bd2-6d73-86f828a76d00/original",
                    "profileToken": {
                        "tokenUri": ""
                    }
                },
                "followerCount": 359487,
                "followingCount": 3851,
                "username": "dwr",
                "pfp": {
                    "url": "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/bc698287-5adc-4cc5-a503-de16963ed900/original",
                    "verified": false
                },
                "referrerUsername": "farcaster",
                "viewerContext": {
                    "following": true,
                    "followedBy": true,
                    "enableNotifications": false
                }
            },
            {
                "fid": 288004,
                "displayName": "Youdah",
                "profile": {
                    "bio": {
                        "text": "Ok",
                        "mentions": [],
                        "channelMentions": []
                    },
                    "location": {
                        "placeId": "",
                        "description": ""
                    }
                },
                "followerCount": 769,
                "followingCount": 1087,
                "username": "dwrkntl",
                "pfp": {
                    "url": "https://i.imgur.com/sEhNR7R.jpg",
                    "verified": false
                },
                "viewerContext": {
                    "following": false,
                    "followedBy": false,
                    "enableNotifications": false
                }
            }
        ]
    },
    "next": {
        "cursor": "eyJsaW1pdCI6MiwicGFnZSI6MX0"
    }
}

3. https://client.farcaster.xyz/v2/search-casts?q=dwr&limit=20

Response: "{
    "result": {
        "casts": [
            {
                "hash": "0x81164bf595fc977da223f260ea64946a43b5bb43",
                "threadHash": "0x81164bf595fc977da223f260ea64946a43b5bb43",
                "author": {
                    "fid": 310124,
                    "displayName": "eggman 🔵",
                    "profile": {
                        "bio": {
                            "text": "e/acc || Building @ /imgn || Dogecoin core dev 2013/14",
                            "mentions": [],
                            "channelMentions": [
                                "imgn"
                            ]
                        },
                        "location": {
                            "placeId": "",
                            "description": ""
                        },
                        "earlyWalletAdopter": true,
                        "accountLevel": "pro",
                        "url": "",
                        "bannerImageUrl": "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/5be4ec44-ff11-4540-71a9-e59b29d57700/original",
                        "profileToken": {
                            "tokenUri": "eip155:8453/erc20:0x9bba915f036158582c20b51113b925f243a1a1a1",
                            "token": {
                                "chain": "base",
                                "ca": "0x9bba915f036158582c20b51113b925f243a1a1a1",
                                "tokenId": "0198d3d7-5f0a-de22-7e4d-4cb0767d17a7",
                                "name": "IMGN Labs",
                                "ticker": "IMGN",
                                "symbol": "IMGN",
                                "imageUrl": "https://coin-images.coingecko.com/coins/images/55178/large/imgn.jpg?1744378233"
                            }
                        }
                    },
                    "followerCount": 9353,
                    "followingCount": 1945,
                    "username": "eggman.eth",
                    "pfp": {
                        "url": "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/26adec53-b6bd-4bd2-60fe-bd454fa1ca00/original",
                        "verified": false
                    },
                    "viewerContext": {
                        "following": false
                    }
                },
                "text": "📸 👇 \n\nAttach your Warplet in the replies, deadline is Friday\n\nCapping at max 1000 cos it's a free drop and I ain't made of compute.\n\nPre-assigned: @sayangel gets ID 0, @dwr gets 1, @horsefacts.eth gets 2 otherwise he'll fud your bags.",
                "timestamp": 1761674623000,
                "replies": {
                    "count": 1054
                },
                "reactions": {
                    "count": 1851
                },
                "recasts": {
                    "count": 636,
                    "recasters": [
                        {
                            "fid": 3,
                            "displayName": "Dan Romero",
                            "username": "dwr",
                            "recastHash": "0x6b62d277c0e756de6ee485b8496c7acec1975f40"
                        }
                    ]
                },
                "watches": {
                    "count": 0
                },
                "mentions": [
                    {
                        "fid": 3,
                        "displayName": "Dan Romero",
                        "profile": {
                            "bio": {
                                "text": "Working on Farcaster",
                                "mentions": [],
                                "channelMentions": []
                            },
                            "location": {
                                "placeId": "ChIJE9on3F3HwoAR9AhGJW_fL-I",
                                "description": "Los Angeles, CA, USA"
                            },
                            "earlyWalletAdopter": true,
                            "accountLevel": "pro",
                            "url": "https://danromero.org",
                            "bannerImageUrl": "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/dab99f37-561b-4bd2-6d73-86f828a76d00/original",
                            "profileToken": {
                                "tokenUri": ""
                            }
                        },
                        "followerCount": 359487,
                        "followingCount": 3851,
                        "username": "dwr",
                        "pfp": {
                            "url": "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/bc698287-5adc-4cc5-a503-de16963ed900/original",
                            "verified": false
                        }
                    },
                    {
                        "fid": 1725,
                        "displayName": "Angel",
                        "profile": {
                            "bio": {
                                "text": "Warplets guy | Cofounder @ Resolve (YC) - spatial tech for construction. FC tinkering: @livecaster @harmonybot |  I just want us to have fun.",
                                "mentions": [
                                    "livecaster",
                                    "harmonybot"
                                ],
                                "channelMentions": []
                            },
                            "location": {
                                "placeId": "",
                                "description": ""
                            },
                            "earlyWalletAdopter": true,
                            "accountLevel": "pro",
                            "url": "",
                            "bannerImageUrl": "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/baaf4019-d8ed-4ec2-2520-3f31e3e2fe00/original",
                            "profileToken": {
                                "tokenUri": ""
                            }
                        },
                        "followerCount": 36166,
                        "follow"