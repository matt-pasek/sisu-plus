import { PrivatePerson } from '@/app/api/generated/OriApi';
import { AnimatePresence, motion } from 'motion/react';
import React from 'react';

interface Props {
  userDetails: PrivatePerson;
}

export const AccountDropdown: React.FC<Props> = ({ userDetails }) => {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        id="dropdownInformationButton"
        data-dropdown-toggle="dropdownInformation"
        className="flex items-center gap-2 rounded-xl border border-solid border-border2 bg-container2 text-xs transition-[transform] duration-150 active:scale-[0.96]"
        type="button"
        onClick={() => setIsDropdownOpen((prevState) => !prevState)}
      >
        <div className="flex size-7 items-center justify-center rounded-full bg-accent text-xs font-semibold">
          {userDetails?.firstNames?.[0]}
          {userDetails?.lastName?.[0]}
        </div>
        <span className="text-offwhite">
          {userDetails?.callName} {userDetails?.lastName}
        </span>
        <div className="-ml-1 pr-2">
          <svg
            className={`size-3 ${isDropdownOpen ? '-rotate-180' : ''} transition-transform duration-200`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m19 9-7 7-7-7"
            />
          </svg>
        </div>
      </button>
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ type: 'spring', duration: 0.25, bounce: 0 }}
            style={{ transformOrigin: 'top right' }}
            className="rounded-base absolute top-10 right-0 z-20 w-72 border border-border2 bg-container2 shadow-lg"
          >
            <div className="p-2">
              <div className="flex items-center gap-2 rounded p-2 px-2.5 text-sm">
                <div className="rounded-full bg-accent p-2 text-xs font-medium">
                  {userDetails.firstNames?.[0]}
                  {userDetails.lastName?.[0]}
                </div>
                <div>
                  <div className="font-medium">
                    {userDetails.firstNames} {userDetails.lastName}
                  </div>
                  <div className="text-xs font-light">{userDetails.primaryEmail}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
